import { Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { SharedService } from 'src/services/shared.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CvService extends SharedService<Cv> {
  constructor(@InjectRepository(Cv) repo: Repository<Cv>) {
    super(repo);
  }
 
}
