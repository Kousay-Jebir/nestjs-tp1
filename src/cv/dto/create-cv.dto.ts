import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCvDto {
  @IsString()
  name: string;

  @IsString()
  firstname: string;

  @IsInt()
  age: number;

  @IsString()
  Cin: string;

  @IsString()
  Job: string;

  @IsOptional()
  @IsString()
  path?: string;
}
