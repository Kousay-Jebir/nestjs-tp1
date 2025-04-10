import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SharedService } from 'src/services/shared.service';
import { Skill } from './entities/skill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SkillService extends SharedService<Skill> {
  constructor(@InjectRepository(Skill) repo: Repository<Skill>) {
      super(repo);
    }
}
