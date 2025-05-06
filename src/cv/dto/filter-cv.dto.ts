import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PaginationDto } from 'src/services/pagination.dto';

export class CvFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  criteria?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  age?: number;
}
