import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import {
  fetchDataFromAcessTokenGet,
  addDataFromAcessTokenGet,
  getAccessTokenFromCreds,
} from './fetchData';
import * as qs from 'qs';

export const registerEntity = async (
  httpService: HttpService,
  entityData: any,
  endpointUri: string,
) => {
  try {
console.log("entity data for registerEntity "+JSON.stringify(entityData))
console.log("endpointUri is  "+endpointUri)
const res = await lastValueFrom(
      httpService.post(endpointUri, entityData, { timeout: 3000 }).pipe(map((item) => item.data)),
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
    console.log("end point url "+endpointUri)
    console.log("entityFilterData is "+JSON.stringify(entityFilterData))
    const res = await lastValueFrom(
      httpService
        .post(endpointUri, entityFilterData, { timeout: 3000 })
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
          headers: { 'Content-type': 'application/json' }, timeout: 3000
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

export const updateStudentEntity = async (
  httpService: HttpService,
  entityData: any,
  endpointUri: string,
  clientIDSecret: string,
) => {
  try {
    const res = await lastValueFrom(
      httpService
        .put(endpointUri, JSON.stringify(entityData), {
          headers: { 'Content-type': 'application/json',Authorization: `Bearer ${clientIDSecret}`, }, timeout: 3000
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

export const createUserEntity = async (
  httpService: HttpService,
  adminAccessTokenURL: string,
  entityUsername: string,
  userData: any,
  adminUsername: string,
  adminPassword: string,
  createUserBaseURL: string,
  adminUserInfoUrl: string,
) => {
  const data = qs.stringify({
    username: adminUsername,
    password: adminPassword,
    grant_type: 'password',
    client_id: 'admin-cli',
  });
  console.log("data inside the crate entity method "+data)
  let adminAcessToken;
  try {
    adminAcessToken = await getAccessTokenFromCreds(
      data,
      adminAccessTokenURL,
      httpService,
      '',
    );
  } catch (e) {
    //console.log(e.response.data);
    throw new HttpException(
      'Cant fetch admin access token',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  console.log("adminAcessToken is "+JSON.stringify(adminAcessToken));
  console.log("adminAcessToken.access_token := " + adminAcessToken.access_token);
  try {
    console.log(adminUserInfoUrl + `?username=${entityUsername}&exact=true`);
    const data = await fetchDataFromAcessTokenGet(
      adminAcessToken.access_token,
      adminUserInfoUrl + `?username=${entityUsername}&exact=true`,
      httpService,
    );
    console.log("data is "+JSON.stringify(data));
    if(!data.length) {
       console.log("userData is "+userData);
       console.log("userData again is "+JSON.stringify(userData));
       console.log("createUserBaseURL is "+createUserBaseURL);
	    const addUser = await addDataFromAcessTokenGet(
	      userData,
	      createUserBaseURL,
	      httpService,
	      adminAcessToken.access_token,
	    );
       console.log("addUser is "+addUser);
       console.log("addUser is "+JSON.stringify(addUser));
    }
  } catch (e) {
    console.log(e);
    throw new HttpException(
      "Unable to create user",
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
  console.log("reset password data is "+data)
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
  console.log("adminAcessToken is "+JSON.stringify(adminAcessToken));
  console.log("adminAcessToken.access_token := " + adminAcessToken.access_token);
  let entityRCUserId;
  try {
    console.log(adminUserInfoUrl + `?username=${entityUsername}&exact=true`);
    const data = await fetchDataFromAcessTokenGet(
      adminAcessToken.access_token,
      adminUserInfoUrl + `?username=${entityUsername}&exact=true`,
      httpService,
    );
    console.log("data is "+JSON.stringify(data));
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
  console.log("resetPassData is "+resetPassData);
  console.log("resetPassData is "+JSON.stringify(resetPassData));
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
            timeout: 3000 ,
          },
        )
        .pipe(map((item) => item.data)),
    );
    console.log("response is "+res)
    console.log("response is "+JSON.stringify(res));
    return res;
  } catch (e) {
    console.log(e.response.data);
    throw new HttpException(
      'Error while Resetting password',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
