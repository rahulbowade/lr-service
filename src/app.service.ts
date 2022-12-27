import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import * as qs from 'qs';
import { HttpService } from '@nestjs/axios';
import { fetchDataFromAcessToken } from 'util/fetchData';
import { registerEntity, searchEntity, updateEntity } from 'util/entityHelper';

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
      scope: 'openid phone email address-casa',
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
      console.log(e);
      throw new HttpException('Get registered on CASA', HttpStatus.NOT_FOUND);
    }
    console.log(instituteData);
    const searchRes: Array<any> = await searchEntity(
      this.httpService,
      process.env.BASE_URI_RC + 'Institute/search',
      {
        filters: {
          username: {
            eq: instituteData.preferred_username,
          },
        },
        limit: 1,
        offset: 0,
      },
    );
    const entityData = {
      name: instituteData.name,
      phoneNumber: instituteData.phone ? instituteData.phone : '1234567890',
      email: instituteData.email,
      username: instituteData.preferred_username,
      address: instituteData['address-casa']
        ? instituteData['address-casa']
        : 'NOT PROVIDED',
    };
    if (searchRes.length) {
      {
        const updateActionRes = await updateEntity(
          this.httpService,
          entityData,
          process.env.BASE_URI_RC + `Institute/${searchRes[0].osid}`,
        );
        return updateActionRes;
      }
    } else {
      const registerUserRes = await registerEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Institute/invite`,
      );
      return registerUserRes;
    }
  }
}
