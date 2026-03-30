import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../../templates/template.entity';
import * as bcrypt from 'bcrypt';

import { SignupDto } from '../dto/signup.dto';

@Injectable()
export class SignupService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Template)
    private templatesRepository: Repository<Template>,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, email, password } = signupDto;

    const userExist = await this.usersService.findByEmail(email);
    if (userExist) {
      throw new ConflictException('This email already exists in the record');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
    });

    const defaultTemplate = this.templatesRepository.create({
      userId: newUser.id,
      templateName: 'Standard Template',
      isDefault: true,
      margins: {
        top: 0.7,
        bottom: 0.7,
        left: 0.55,
        right: 0.4,
      },
      fontSize: 8,
      labelFontSize: 8,
    });

    await this.templatesRepository.save(defaultTemplate);

    // Return specific fields or the whole user
    return { name, email, id: newUser.id };
  }
}
