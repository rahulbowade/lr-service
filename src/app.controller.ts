import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { LoginDto } from 'dto/Login.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  helloWorld() {
    return this.appService.getHello();
  }

  @Post('login/Institute')
  loginInstitute(@Body() loginDto: LoginDto) {
    return this.appService.loginInstitue(loginDto.username, loginDto.password);
  }

  @Post('login/Tutor')
  loginTutor(@Body() loginDto: LoginDto) {
    return this.appService.loginTutor(loginDto.username, loginDto.password);
  }

  @Post('login/Student')
  loginStudent(@Body() loginDto: LoginDto) {
    console.log("Befor calling the loginStudent method@@@");
    return this.appService.loginStudent(loginDto.username, loginDto.password);
  }

  @Post('register/Tutor')
  registerTutor(@Body() loginDto: LoginDto) {
    return this.appService.registerTutor(loginDto.username, loginDto.password);
  }

  @Post('register/Student')
  registerStudent(@Body() loginDto: LoginDto) {
    return this.appService.registerStudent(
      loginDto.username,
      loginDto.password,
    );
  }

  @Get('callback')
  getHello(@Req() request: Request): string {
    return this.appService.getHello();
  }
}
