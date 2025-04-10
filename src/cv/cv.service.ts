import { Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { SharedService } from 'src/services/shared.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';
import { CvFilterDto } from './dto/filter-cv.dto';

@Injectable()
export class CvService extends SharedService<Cv> {
  constructor(@InjectRepository(Cv) repo: Repository<Cv>) {
    super(repo);
  }

  async findByQuery(filter? : CvFilterDto):Promise<Cv[]>{
    const {criteria,age}=filter || {}
    const query = this.repository.createQueryBuilder('cv')

 if (criteria) {
    query.andWhere(
      '(cv.name LIKE :criteria OR cv.firstname LIKE :criteria OR cv.job LIKE :criteria)',
      { criteria: `%${criteria}%` },
    );
  }

  if (age !== undefined) {
    query.andWhere('cv.age = :age', { age });
  }

  return await query.getMany();

  }
 
}
