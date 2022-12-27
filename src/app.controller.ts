import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { InstituteDto } from 'interfaces/institute.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('login')
  login(@Body() institudeDto: InstituteDto) {
    return this.appService.login(institudeDto.username, institudeDto.password);
  }

  @Get('callback')
  getHello(@Req() request: Request): string {
    return this.appService.getHello();
  }
}
