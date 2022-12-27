import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import * as qs from 'qs';
import { HttpService } from '@nestjs/axios';
import { fetchDataFromAcessToken } from 'util/fetchData';
import { searchEntity, updateEntity } from 'util/entityHelper';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async login(username: string, password: string) {
    const data = qs.stringify({
      username: username,
      password: password,
      grant_type: 'password',
      scope: 'openid phone email address',
    });
    const config: any = {
      url: process.env.ACCESS_TOKEN_URI,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${process.env.ENCODED_CLIENTID_CLIENTSECRETS}`,
      },
      data: data,
    };
    let instituteData;
    try {
      const res = await lastValueFrom(
        this.httpService
          .post(config.url, config.data, { headers: config.headers })
          .pipe(map((item) => item.data)),
      );
      const access_token = res.access_token;
      instituteData = await fetchDataFromAcessToken(
        access_token,
        process.env.INFO_URI_CASA,
        this.httpService,
      );
      // search in RC using institute's username
    } catch (e) {
      throw new HttpException('Get registered on CASA', HttpStatus.NOT_FOUND);
    }
    console.log(instituteData);
    const searchRes: Array<any> = await searchEntity(
      this.httpService,
      process.env.BASE_URI_RC + 'Institute/search',
      {
        filters: {
          username: {
            eq: 'unik-new',
          },
        },
        limit: 1,
        offset: 0,
      },
    );
    console.log(searchRes);
    if (searchRes.length) {
      {
        const updatedData = {
          name: instituteData.name,
          phoneNumber: instituteData.phone ? instituteData.phone : '123456',
          email: instituteData.email,
          username: instituteData.preferred_username,
          address: instituteData.address.address
            ? instituteData.address
            : 'GHAR',
        };
        const updateActionRes = await updateEntity(
          this.httpService,
          updatedData,
          process.env.BASE_URI_RC + `Institue/${searchRes[0].osid}`,
        );
        return updateActionRes;
      }
    } else {
      // TODO: call register user helper
      return 'register User';
    }
  }
}
