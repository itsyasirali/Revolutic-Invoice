import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { SignupService } from './service/signup.service';
import { LoginService } from './service/login.service';
import { LogoutService } from './service/logout.service';
import { UsersModule } from '../users/users.module';
import { Template } from '../templates/template.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Template])],
  controllers: [AuthController],
  providers: [SignupService, LoginService, LogoutService],
})
export class AuthModule {}
