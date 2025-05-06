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
import { PaginationDto } from 'src/services/pagination.dto';
import { EventsService } from '../events/events.service';
import { EventType } from '../events/entities/event.entity';
import { EventsGateway } from '../events/events.gateway';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CvService extends SharedService<Cv> {
  constructor(
    @InjectRepository(Cv) repo: Repository<Cv>,
    private readonly userService: UserService,
    private readonly eventsService: EventsService,
    private readonly eventsGateway: EventsGateway,
  ) {
    super(repo);
  }

  async findByQuery(filter?: CvFilterDto): Promise<Cv[]> {
    const { criteria, age, limit, offset } = filter || {};
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
    return offset && limit
      ? await query.skip(offset).take(limit).getMany()
      : await query.getMany();
  }

  async create(createCvDto: CreateCvDto): Promise<Cv> {
    const cv = this.repository.create({
      name: createCvDto.name,
      firstname: createCvDto.firstname,
      age: createCvDto.age,
      cin: createCvDto.cin,
      job: createCvDto.job,
      path: createCvDto.path || '',
    });
    return await this.repository.save(cv);
  }

  async createWithUser(createCvDto: CreateCvDto, userId: number): Promise<Cv> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const cv = this.repository.create({
      name: createCvDto.name,
      firstname: createCvDto.firstname,
      age: createCvDto.age,
      cin: createCvDto.cin,
      job: createCvDto.job,
      path: createCvDto.path || '',
      user,
    });

    const savedCv = await this.repository.save(cv);

    // Log event and notify
    const event = await this.eventsService.createEvent(
      EventType.CREATE,
      user,
      savedCv,
      { dto: createCvDto },
    );
    this.eventsGateway.notifyEvent(event);

    return savedCv;
  }

  async updateWithUser(id: number, updateCvDto: any, user: User): Promise<Cv> {
    const cv = await this.findOne(id);
    if (!cv) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    const updatedCv = await super.update(id, updateCvDto);

    // Log event and notify
    const event = await this.eventsService.createEvent(
      EventType.UPDATE,
      user,
      updatedCv,
      { dto: updateCvDto },
    );
    this.eventsGateway.notifyEvent(event);

    return updatedCv;
  }

  async deleteWithUser(id: number, user: User): Promise<void> {
    const cv = await this.findOne(id);
    if (!cv) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    // Log event before deletion
    const event = await this.eventsService.createEvent(
      EventType.DELETE,
      user,
      cv,
    );

    await super.delete(id);

    // Notify after deletion
    this.eventsGateway.notifyEvent(event);
  }

  async updatePhoto(id: number, filename: string, user: User) {
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
    const updatedCv = await this.repository.save(cv);

    // Log event and notify
    const event = await this.eventsService.createEvent(
      EventType.PHOTO_UPDATE,
      user,
      updatedCv,
      { filename },
    );
    this.eventsGateway.notifyEvent(event);

    return updatedCv;
  }
}
