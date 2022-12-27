import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

export const fetchDataFromAcessToken = async (
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
