import { Controller, Post, Get, Put, Body, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { SignupService } from './service/signup.service';
import { LoginService } from './service/login.service';
import { LogoutService } from './service/logout.service';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupService: SignupService,
    private readonly loginService: LoginService,
    private readonly logoutService: LogoutService,
    private readonly usersService: UsersService,
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

  @Put('profile')
  @Post('profile')
  async updateProfile(
    @Req() req: Request,
    @Body() body: { name?: string; email?: string; currentPassword?: string; newPassword?: string },
    @Res() res: Response,
  ) {
    const sessionUser = (req.session as any).user;
    if (!sessionUser || !sessionUser.id) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      const user = await this.usersService.findById(sessionUser.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const updateData: Record<string, any> = {};

      if (body.name && body.name.trim()) {
        updateData.name = body.name.trim();
      }

      if (body.email && body.email.trim() && body.email.toLowerCase() !== user.email.toLowerCase()) {
        const existing = await this.usersService.findByEmail(body.email.trim());
        if (existing && existing.id !== user.id) {
          return res.status(409).json({ message: 'Email address is already in use by another account' });
        }
        updateData.email = body.email.trim();
      }

      if (body.newPassword) {
        if (body.currentPassword) {
          const isMatch = await bcrypt.compare(body.currentPassword, user.password);
          if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
          }
        }
        updateData.password = await bcrypt.hash(body.newPassword, 10);
      }

      const updatedUser = await this.usersService.update(sessionUser.id, updateData);

      // Update active session user details
      (req.session as any).user = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      };

      const successMessage = body.newPassword ? 'Password updated successfully' : 'Profile updated successfully';

      return res.status(200).json({
        message: successMessage,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }
  }
}
