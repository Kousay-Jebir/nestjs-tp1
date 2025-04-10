import { Type } from "class-transformer"
import { IsString,IsOptional, IsNumber } from "class-validator"

export class CvFilterDto{
    @IsOptional()
    @IsString()
    
    criteria?: string
    
    @IsOptional()
    @Type(() => Number)
    
    @IsNumber()
    
    age?:number
    
    }