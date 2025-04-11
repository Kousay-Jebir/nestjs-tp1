import { Role } from '../../user/enums/role.enum';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must be at most 20 characters long' })
  username: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsEnum(Role, { message: 'Role must be one of the valid roles' })
  role: Role;
}
