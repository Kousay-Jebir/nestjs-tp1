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
import { Role } from 'src/user/enums/role.enum';
import { User } from 'src/user/entities/user.entity';
import { use } from 'passport';
import { EventBus } from '@nestjs/cqrs';
import { ActionEvent } from 'src/event/event';
import { ActionTypeEnum } from 'src/history/enum/action-type.enum';
import { EntityType } from 'src/history/enum/entity-type.enum';
import { CustomEventEmitter } from 'src/event/event-emitter.service';
import { Inject } from '@nestjs/common';

@Injectable()
export class SharedService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>
  ) { }
  @Inject(CustomEventEmitter)
  protected readonly events!: CustomEventEmitter;
  private get entityType(): EntityType {
    const name = this.repository.metadata.name;
    return EntityType[name.toUpperCase() as keyof typeof EntityType];
  }

  async findAll(filter?: PaginationDto, user?: any): Promise<T[]> {
    try {
      const options: any = {};


      if (user?.role !== 'admin') {
        options.where = { user: { id: user?.userId } } as any;
      }

      if (filter?.limit !== undefined && filter?.offset !== undefined) {
        options.take = filter.limit;
        options.skip = filter.offset;
      }

      return await this.repository.find(options);
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

  async update(id: number, data: DeepPartial<T>, userId: number): Promise<T> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    const updated = this.repository.create({
      ...entity,
      ...data,
    });
    console.log("emitting")
    this.events.emitEvent(
      {
        entityType: this.entityType,
        entityId: id,
        action: ActionTypeEnum.UPDATE,
        performedByUserId: userId,
      }
    )
    return this.repository.save(updated);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
  }
}
