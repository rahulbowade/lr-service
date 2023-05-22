import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import * as qs from 'qs';

export const fetchDataFromAcessTokenPost = async (
  access_token: string,
  info_uri: string,
  httpService: HttpService,
) => {
  const res = await lastValueFrom(
    httpService
      .post(
        info_uri,
        {},
        { headers: { Authorization: `Bearer ${access_token}` } },
      )
      .pipe(map((item) => item.data)),
  );
  return res;
};

export const fetchDataFromAcessTokenGet = async (
  access_token: string,
  info_uri: string,
  httpService: HttpService,
) => {
  const res = await lastValueFrom(
    httpService
      .get(info_uri, { headers: { Authorization: `Bearer ${access_token}` }, timeout: 3000})
      .pipe(map((item) => item.data)),
  );
  return res;
};

export const getAccessTokenFromCreds = async (
  data: any,
  authURI: string,
  httpService: HttpService,
  clientIDSecret: string,
) => {
  const config: any = {
    url: authURI,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${clientIDSecret}`,
    },
    data: data,
  };
  const res = await lastValueFrom(
    httpService
      .post(config.url, config.data, { headers: config.headers , timeout: 3000})
      .pipe(map((item) => item.data)),
  );
  return res;
};

export const addDataFromAcessTokenGet = async (
  data: any,
  authURI: string,
  httpService: HttpService,
  clientIDSecret: string,
) => {
  const config: any = {
    url: authURI,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${clientIDSecret}`,
    },
    data: data,
  };
  const res = await lastValueFrom(
    httpService
      .post(config.url, config.data, { headers: config.headers ,timeout: 3000})
      .pipe(map((item) => item.data)),
  );
  return res;
};
