import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';

export const registerEntity = async (
  httpService: HttpService,
  entityData: any,
  endpointUri: string,
) => {
  try {
    const res = await lastValueFrom(
      httpService.post(endpointUri, entityData).pipe(map((item) => item.data)),
    );
    return res;
  } catch (e) {
    console.log(e);
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
