import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { LoginDto } from 'interfaces/Login.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
    return this.appService.loginStudent(loginDto.username, loginDto.password);
  }

  @Get('callback')
  getHello(@Req() request: Request): string {
    return this.appService.getHello();
  }
}
