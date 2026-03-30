import { Controller, Post, Get, Body, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { SignupService } from './service/signup.service';
import { LoginService } from './service/login.service';
import { LogoutService } from './service/logout.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupService: SignupService,
    private readonly loginService: LoginService,
    private readonly logoutService: LogoutService,
  ) { }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
    try {
      const result = await this.signupService.signup(signupDto);
      return res.status(201).json({ message: 'User created successfully', user: result });
    } catch (error: any) {
      if (error.status === 409) {
        return res.status(409).json({ message: error.message });
      }
      console.error(error);
      return res.status(500).json({ message: 'Server error, please try again later' });
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.loginService.login(loginDto);

      // Set session
      (req.session as any).user = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      if (error.status === 404 || error.status === 400 || error.status === 401) {
        return res.status(error.status || 400).json({ message: error.message });
      }
      console.error(error);
      return res.status(500).json({ message: 'Server error, please try again later' });
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      await this.logoutService.logout(req);
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Could not log out' });
    }
  }


  @Get('me')
  getProfile(@Req() req: Request) {
    const user = (req.session as any).user;
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return { user };
  }
}
