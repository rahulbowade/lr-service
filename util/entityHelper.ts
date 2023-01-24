import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import {
  fetchDataFromAcessTokenGet,
  getAccessTokenFromCreds,
} from './fetchData';
import * as qs from 'qs';

export const registerEntity = async (
  httpService: HttpService,
  entityData: any,
  endpointUri: string,
) => {
  try {
    const res = await lastValueFrom(
      httpService.post(endpointUri, entityData).pipe(map((item) => item.data)),
    );
    console.log(res);
    return res;
  } 
  catch (e) {
    console.log(e.response.data);
    throw new HttpException(
      'Error while creating entity',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const searchEntity = async (
  httpService: HttpService,
  endpointUri: string,
  entityFilterData: any,
) => {
  try {
    const res = await lastValueFrom(
      httpService
        .post(endpointUri, entityFilterData)
        .pipe(map((item) => item.data)),
    );
    return res;
  } catch (e) {
    console.log(e);
    throw new HttpException('500 Internal', HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getEntityByID = async (
  httpService: HttpService,
  endpointUri: string,
) => {
  const res = await lastValueFrom(
    httpService
      .get(endpointUri, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(map((item) => item.data)),
  );
  return res;
};

export const updateEntity = async (
  httpService: HttpService,
  entityData: any,
  endpointUri: string,
) => {
  try {
    const res = await lastValueFrom(
      httpService
        .put(endpointUri, JSON.stringify(entityData), {
          headers: { 'Content-type': 'application/json' },
        })
        .pipe(map((item) => item.data)),
    );
    return res;
  } catch (e) {
    console.log(e);
    throw new HttpException(
      '500 Internal while Updating Entity',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const resetPasswordEntity = async (
  httpService: HttpService,
  adminAccessTokenURL: string,
  resetPasswordBaseURL: string,
  entityUsername: string,
  entityPassword: string,
  adminUsername: string,
  adminPassword: string,
  adminUserInfoUrl: string,
) => {
  const data = qs.stringify({
    username: adminUsername,
    password: adminPassword,
    grant_type: 'password',
    client_id: 'admin-cli',
  });
  let adminAcessToken;
  try {
    adminAcessToken = await getAccessTokenFromCreds(
      data,
      adminAccessTokenURL,
      httpService,
      '',
    );
  } catch (e) {
    console.log(e.response.data);
    throw new HttpException(
      'Cant fetch admin access token',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  console.log(adminAcessToken);
  let entityRCUserId;
  try {
    console.log(adminUserInfoUrl + `?username=${entityUsername}&exact=true`);
    const data = await fetchDataFromAcessTokenGet(
      adminAcessToken.access_token,
      adminUserInfoUrl + `?username=${entityUsername}&exact=true`,
      httpService,
    );
    entityRCUserId = data[0].id;
  } catch (e) {
    console.log(e);
    throw new HttpException(
      "Can't find user by username",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  const resetPassData = {
    type: 'password',
    temporary: 'false',
    value: entityPassword,
  };
  try {
    const res = await lastValueFrom(
      httpService
        .put(
          resetPasswordBaseURL + `${entityRCUserId}/reset-password`,
          JSON.stringify(resetPassData),
          {
            headers: {
              'Content-type': 'application/json',
              Authorization: `Bearer ${adminAcessToken.access_token}`,
            },
          },
        )
        .pipe(map((item) => item.data)),
    );
    return res;
  } catch (e) {
    console.log(e.response.data);
    throw new HttpException(
      'Error while Resetting password',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
