import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository,DeepPartial } from 'typeorm';


@Injectable()
export class SharedService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  findAll(): Promise<T[]> {
    return this.repository.find();
  }

  findOne(id: number): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }


create(data: DeepPartial<T>): Promise<T> {
  const entity = this.repository.create(data);
  return this.repository.save(entity);
}


  update(id: number, data: Partial<T>) {
    return this.repository.save({ ...data, id } as any);
  }

  delete(id: number): Promise<void> {
    return this.repository.delete(id).then(() => undefined);
  }
  
}
