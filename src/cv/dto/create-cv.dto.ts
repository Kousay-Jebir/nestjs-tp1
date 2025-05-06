import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCvDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  age: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  cin: number;

  @IsString()
  @IsNotEmpty()
  job: string;

  @IsString()
  @IsOptional()
  path?: string;
}
