import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  fetchDataFromAcessToken,
  getAccessTokenFromCreds,
} from 'util/fetchData';
import { registerEntity, searchEntity, updateEntity } from 'util/entityHelper';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as qs from 'qs';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async loginInstitue(username: string, password: string) {
    let res;
    // Try Login Using CASA
    try {
      const data = qs.stringify({
        username: username,
        password: password,
        grant_type: 'password',
        scope: 'openid phone address-casa email',
      });
      res = await getAccessTokenFromCreds(
        data,
        process.env.ACCESS_TOKEN_URI_CASA,
        this.httpService,
        process.env.ENCODED_CLIENTID_CLIENTSECRETS_CASA,
      );
    } catch (e) {
      throw new HttpException('Get registered on CASA', HttpStatus.NOT_FOUND);
    }

    const access_token = res.access_token;
    const instituteData = await fetchDataFromAcessToken(
      access_token,
      process.env.INFO_URI_CASA,
      this.httpService,
    );

    // search in RC using institute's username
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

    // Update or register institute
    const entityData = {
      name: instituteData.name,
      phoneNumber: instituteData.phone ? instituteData.phone : '',
      email: instituteData.email,
      username: instituteData.preferred_username,
      address: instituteData['address-casa']
        ? instituteData['address-casa']
        : '',
    };
    let userid;
    if (searchRes.length) {
      userid = searchRes[0].osid;
      updateEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Institute/${searchRes[0].osid}`,
      );
    } else {
      const registerUserRes = await registerEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Institute/invite`,
      );
      userid = registerUserRes.result.Institute.osid;
    }
    let rc_res;
    try {
      const data = qs.stringify({
        username: username,
        password: 'test',
        grant_type: 'password',
        scope: 'openid',
        client_id: 'registry-frontend',
      });
      rc_res = await getAccessTokenFromCreds(
        data,
        process.env.ACCESS_TOKEN_URI_RC,
        this.httpService,
        '',
      );
    } catch (e) {
      console.log(e);
      throw new HttpException(
        "Can't get token from RC keycloak",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { ...rc_res, userid };
  }

  async loginTutor(username: string, password: string) {
    // fetch data from backend wrapper
    let tutorId;
    try {
      let _;
      [_, tutorId] = username.split('_');
      if (_ !== 'tutor') throw new Error('Username should be of form tutor_id');
    } catch (e) {
      throw new HttpException(
        'Invalid username or not registered on CASA',
        HttpStatus.NOT_FOUND,
      );
    }
    const res = await lastValueFrom(
      this.httpService.get(process.env.TUTOR_DATA_CASA_BASE_URI + tutorId),
    );
    const tutorData = res.data;

    // search in RC using Tutor's username
    console.log(tutorData);
    const searchRes: Array<any> = await searchEntity(
      this.httpService,
      process.env.BASE_URI_RC + 'Tutor/search',
      {
        filters: {
          username: {
            eq: username,
          },
        },
        limit: 1,
        offset: 0,
      },
    );

    // Update or register Tutor
    const entityData = {
      name: tutorData.TutorName,
      phoneNumber: tutorData.ContactDetails ? tutorData.ContactDetails : '',
      email: '',
      username: username,
      tutorKey: tutorData.TutorKey.toString(),
      centerKey: tutorData.CenterKey.toString(),
      qualifications: tutorData.Qualification,
      aadhaarNo: tutorData.aadhaarNo,
    };
    let userid;
    if (searchRes.length) {
      // Update Data
      userid = searchRes[0].osid;
      updateEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Tutor/${searchRes[0].osid}`,
      );
    } else {
      const registerUserRes = await registerEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Tutor/invite`,
      );
      userid = registerUserRes.result.Tutor.osid;
    }
    let rc_res;
    try {
      const data = qs.stringify({
        username: username,
        password: password,
        grant_type: 'password',
        scope: 'openid',
        client_id: 'registry-frontend',
      });
      rc_res = await getAccessTokenFromCreds(
        data,
        process.env.ACCESS_TOKEN_URI_RC,
        this.httpService,
        '',
      );
    } catch (e) {
      console.log(e);
      throw new HttpException(
        "Can't get token from RC keycloak",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { ...rc_res, userid };
  }

  async loginStudent(username: string, password: string) {
    // fetch data from backend wrapper
    let studentId;
    try {
      let _;
      [_, studentId] = username.split('_');
      if (_ !== 'student')
        throw new Error('Username should be of form student_id');
    } catch (e) {
      throw new HttpException(
        'Invalid username or not registered on CASA',
        HttpStatus.NOT_FOUND,
      );
    }
    const res = await lastValueFrom(
      this.httpService.get(process.env.STUDENT_DATA_CASA_BASE_URI + studentId),
    );
    const studentData = res.data;

    // search in RC using Student's username
    console.log(studentData);
    const searchRes: Array<any> = await searchEntity(
      this.httpService,
      process.env.BASE_URI_RC + 'Tutor/search',
      {
        filters: {
          username: {
            eq: username,
          },
        },
        limit: 1,
        offset: 0,
      },
    );

    // Update or register Studnet
    const entityData = {
      name: studentData.StudentName,
      courseKey: studentData.CourseKey.toString(),
      email: '',
      username: username,
      StudentKey: studentData.StudentProfileKey.toString(),
      centerKey: studentData.CenterKey.toString(),
      address: studentData.Address,
      rollNo: studentData.RollNo.toString(),
      dob: studentData.DateOfBirth,
    };
    let userid;
    if (searchRes.length) {
      // Update Data
      userid = searchRes[0].osid;
      updateEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Student/${searchRes[0].osid}`,
      );
    } else {
      const registerUserRes = await registerEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Student/invite`,
      );
      userid = registerUserRes.result.Student.osid;
    }
    let rc_res;
    try {
      const data = qs.stringify({
        username: username,
        password: password,
        grant_type: 'password',
        scope: 'openid',
        client_id: 'registry-frontend',
      });
      rc_res = await getAccessTokenFromCreds(
        data,
        process.env.ACCESS_TOKEN_URI_RC,
        this.httpService,
        '',
      );
    } catch (e) {
      console.log(e);
      throw new HttpException(
        "Can't get token from RC keycloak",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { ...rc_res, userid };
  }
}
