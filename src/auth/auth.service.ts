import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../user/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async signup(signupDto: SignupDto): Promise<void> {
    const { username, password, email, role} = signupDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);


    const user = new User();
    user.username = username;
    user.password = hashedPassword;
    user.email = email;
    user.role = role ?? Role.USER;
    user.salt = salt;

    await this.userRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { username, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
