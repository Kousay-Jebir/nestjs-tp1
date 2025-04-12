import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ObjectLiteral,
  Repository,
  DeepPartial,
  FindOptionsWhere,
} from 'typeorm';
import { PaginationDto } from './pagination.dto';

@Injectable()
export class SharedService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(filter? : PaginationDto): Promise<T[]> {
    try {
      return filter?  await this.repository.find({
        take: filter.limit,
        skip: filter.offset,
      }) : await this.repository.find();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while retrieving the entities',
      );
    }
  }

  async findOne(id: number): Promise<T | null> {
    try {
      const where = { id } as unknown as FindOptionsWhere<T>;
      const entity = await this.repository.findOne({ where });
      if (!entity) {
        throw new NotFoundException(`Entity with id ${id} not found`);
      }
      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `An error occurred while retrieving the entity with id ${id}`,
      );
    }
  }

  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the entity',
      );
    }
  }

  async update(id: number, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    const updated = this.repository.create({
      ...entity,
      ...data,
    });
    return this.repository.save(updated);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
  }
}
