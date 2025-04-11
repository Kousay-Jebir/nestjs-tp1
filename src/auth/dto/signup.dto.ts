import { Role } from '../../user/enums/role.enum';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsString({ message: 'Le nom d\'utilisateur doit être une chaîne de caractères' })
  @MinLength(3, { message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' })
  @MaxLength(20, { message: 'Le nom d\'utilisateur doit contenir au maximum 20 caractères' })
  username: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @IsEmail({}, { message: 'L\'email doit être une adresse email valide' })
  email: string;

  @IsEnum(Role, { message: 'Le rôle doit être l\'un des rôles valides' })
  role: Role;
}
