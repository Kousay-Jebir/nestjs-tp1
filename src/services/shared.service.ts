import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository,DeepPartial } from 'typeorm';


@Injectable()
export class SharedService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  findAll(): Promise<T[]> {
    return this.repository.find();
  }

 async findOne(id: number){
    return await this.repository.findOne({ where: { id } as any });
  }


create(data: DeepPartial<T>): Promise<T> {
  const entity = this.repository.create(data);
  return this.repository.save(entity);
}


  async update(id: number, data: Partial<T>) {
    return await this.repository.save({ ...data, id } as any);
  }

  async delete(id: number): Promise<void> {
    return await this.repository.delete(id).then(() => undefined);
  }
  
}
