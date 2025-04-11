import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { SharedService } from 'src/services/shared.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';
import { CvFilterDto } from './dto/filter-cv.dto';
import { UserService } from 'src/user/user.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CvService extends SharedService<Cv> {
  constructor(
    @InjectRepository(Cv) repo: Repository<Cv>,
    private readonly userService: UserService,
  ) {
    super(repo);
  }

  async findByQuery(filter?: CvFilterDto): Promise<Cv[]> {
    const { criteria, age } = filter || {};
    const query = this.repository.createQueryBuilder('cv');

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

  async createWithUser(createCvDto: CreateCvDto, id: number) {
    const user = await this.userService.findOne(id);

    if (user) {
      const cv = this.repository.create({ ...createCvDto });
      cv.user = user;

      return await this.repository.save(cv);
    }
  }

  async updatePhoto(id: number, filename: string) {
    const cv = await this.findOne(id);
    if (!cv) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    // Delete old photo if exists
    if (cv.path) {
      const oldPath = path.join(process.cwd(), 'public', 'uploads', cv.path);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (error) {
        console.error('Error deleting old photo:', error);
      }
    }

    // Update with new photo
    cv.path = filename;
    return this.repository.save(cv);
  }
}
