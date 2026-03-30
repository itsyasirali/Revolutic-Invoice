import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class LogoutService {
  async logout(req: Request): Promise<string> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err: any) => {
        if (err) {
          return reject(new InternalServerErrorException('Could not log out'));
        }
        resolve('Logout successful');
      });
    });
  }
}
