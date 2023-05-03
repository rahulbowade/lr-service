import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  fetchDataFromAcessTokenPost,
  getAccessTokenFromCreds,
} from 'util/fetchData';
import {
  registerEntity,
  resetPasswordEntity,
  searchEntity,
  updateEntity,
} from 'util/entityHelper';
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
      console.log(e);
      throw new HttpException(
        'Get registered on CASA or invalid creds',
        HttpStatus.NOT_FOUND,
      );
    }

    const access_token = res.access_token;
    const instituteData = await fetchDataFromAcessTokenPost(
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
    console.log(searchRes);
    let osid;
    if (searchRes.length) {
      updateEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Institute/${searchRes[0].osid}`,
      );
      osid = searchRes[0].osid;
    } else {
      await registerEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Institute/invite`,
      );
    }

    await resetPasswordEntity(
      this.httpService,
      process.env.ADMIN_ACCESS_TOKEN_URL,
      process.env.RC_RESET_PASSWORD_BASE_URL,
      username,
      password,
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASS,
      process.env.ADMIN_USER_INFO_URL,
    );
    try {
      const data = qs.stringify({
        username: username,
        password: password,
        grant_type: 'password',
        scope: 'openid',
        client_id: 'registry-frontend',
      });
      const rc_res = await getAccessTokenFromCreds(
        data,
        process.env.ACCESS_TOKEN_URI_RC,
        this.httpService,
        '',
      );
      return { ...rc_res, osid };
    } catch (e) {
      console.log(e.response.data);
      throw new HttpException(
        "Can't get token from RC keycloak - Institute",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    let osid;
    if (searchRes.length) {
      // Found and Update Data
      updateEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Tutor/${searchRes[0].osid}`,
      );
      osid = searchRes[0].osid;
    } else {
      // TODO: redirect to login
      throw new HttpException('Entity not registered', HttpStatus.NOT_FOUND);
    }
    try {
      const data = qs.stringify({
        username: username,
        password: password,
        grant_type: 'password',
        scope: 'openid',
        client_id: 'registry-frontend',
      });
      const rc_res = await getAccessTokenFromCreds(
        data,
        process.env.ACCESS_TOKEN_URI_RC,
        this.httpService,
        '',
      );
      return { ...rc_res, osid };
    } catch (e) {
      console.log(e.response.data);
      throw new HttpException(
        "Can't get token from RC keycloak - Tutor",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginStudent(username: string, password: string) {
    // fetch data from backend wrapper
    let studentId;
    try {
      let _;
      [_, studentId] = username.split('_');
      console.log("Username is "+username);
      if (_ !== 'student')
        throw new Error('Username should be of form student_id');
    } catch (e) {
      console.log(e.response.data);
      throw new HttpException(
        'Invalid username, username should be of form <entity>_{id}',
        HttpStatus.NOT_FOUND,
      );
    }
    console.log("STUDENT_DATA_CASA_BASE_URI is "+process.env.STUDENT_DATA_CASA_BASE_URI);
    console.log("studentId is "+studentId);
    const res = await lastValueFrom(
      this.httpService.get(process.env.STUDENT_DATA_CASA_BASE_URI + studentId),
    );
    const studentData = res.data;
    // search in RC using Student's username
    console.log(studentData);
    console.log("studentData is "+studentData);
    const searchRes: Array<any> = await searchEntity(
      this.httpService,
      process.env.BASE_URI_RC + 'Student/search',
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
    console.log("searchRes is "+searchRes);
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
    console.log();
    console.log("entityData is "+entityData);
    let osid;
    if (searchRes.length) {
      // Update Data
      updateEntity(
        this.httpService,
        entityData,
        process.env.BASE_URI_RC + `Student/${searchRes[0].osid}`,
      );
      osid = searchRes[0].osid;
    } else {
      // TODO: redirect to login
      throw new HttpException('Entity not registered', HttpStatus.NOT_FOUND);
    }

    try {
      const data = qs.stringify({
        username: username,
        password: password,
        grant_type: 'password',
        scope: 'openid',
        client_id: 'registry-frontend',
      });
      console.log("data is "+data);
      const rc_res = await getAccessTokenFromCreds(
        data,
        process.env.ACCESS_TOKEN_URI_RC,
        this.httpService,
        '',
      );
      console.log("rc_res is "+rc_res);
      return { ...rc_res, osid };
    } catch (e) {
      console.log(e.response.data);
      throw new HttpException(
        "Can't get token from RC keycloak - Student",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async registerStudent(username: string, password: string) {
    console.log(username, password);
    let studentId;
    try {
      let _;
      [_, studentId] = username.split('_');
      if (_ !== 'student')
        throw new Error('Username should be of form student_id');
    } catch (e) {
      console.log(e.response.data);
      throw new HttpException('Invalid username', HttpStatus.NOT_FOUND);
    }

    const searchRes: Array<any> = await searchEntity(
      this.httpService,
      process.env.BASE_URI_RC + 'Student/search',
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
    if (searchRes.length) {
      // TODO: redirect to login
      throw new HttpException(
        'Student already registered',
        HttpStatus.NOT_FOUND,
      );
    }
    let studentData;
    try {
      const res = await lastValueFrom(
        this.httpService.get(
          process.env.STUDENT_DATA_CASA_BASE_URI + studentId,
        ),
      );
      if (!res.data) throw new Error('Username not registered on CASA');
      studentData = res.data;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'User not registered on CASA',
        HttpStatus.NOT_FOUND,
      );
    }
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

    await registerEntity(
      this.httpService,
      entityData,
      process.env.BASE_URI_RC + `Student/invite`,
    );
    // Reset password
    await resetPasswordEntity(
      this.httpService,
      process.env.ADMIN_ACCESS_TOKEN_URL,
      process.env.RC_RESET_PASSWORD_BASE_URL,
      username,
      password,
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASS,
      process.env.ADMIN_USER_INFO_URL,
    );
    return 'Successfully registered';
  }

  async registerTutor(username: string, password: string) {
    let tutorId;
    try {
      let _;
      [_, tutorId] = username.split('_');
      if (_ !== 'tutor') throw new Error('Username should be of form tutor_id');
    } catch (e) {
      console.log(e.response.data);
      throw new HttpException('Invalid username', HttpStatus.NOT_FOUND);
    }

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

    if (searchRes.length) {
      // TODO: redirect to login
      throw new HttpException(
        'Student already registered',
        HttpStatus.NOT_FOUND,
      );
    }
    let tutorData;
    try {
      const res = await lastValueFrom(
        this.httpService.get(process.env.TUTOR_DATA_CASA_BASE_URI + tutorId),
      );
      if (!res.data) throw new Error('User not registered on CASA');
      tutorData = res.data;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'User not registered on CASA',
        HttpStatus.NOT_FOUND,
      );
    }

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
    await registerEntity(
      this.httpService,
      entityData,
      process.env.BASE_URI_RC + `Tutor/invite`,
    );
    await resetPasswordEntity(
      this.httpService,
      process.env.ADMIN_ACCESS_TOKEN_URL,
      process.env.RC_RESET_PASSWORD_BASE_URL,
      username,
      password,
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASS,
      process.env.ADMIN_USER_INFO_URL,
    );
    return 'Successfully registered';
  }
}
