import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import * as qs from 'qs';
import { HttpService } from '@nestjs/axios';
import { fetchDataFromAcessToken } from 'util/fetchData';

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
      scope: 'openid address phone email',
    });
    const config: any = {
      url: process.env.ACCESS_TOKEN_URI,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${process.env.ENCODED_CLIENTID_CLIENTSECRETS}`,
      },
      data: data,
    };
    try {
      const res = await lastValueFrom(
        this.httpService
          .post(config.url, config.data, { headers: config.headers })
          .pipe(map((item) => item.data)),
      );
      const access_token = res.access_token;
      return fetchDataFromAcessToken(
        access_token,
        process.env.INFO_URI_CASA,
        this.httpService,
      );
    } catch (e) {
      throw new HttpException('Get registered on CASA', HttpStatus.NOT_FOUND);
    }
  }
}
