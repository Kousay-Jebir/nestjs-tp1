import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../src/user/entities/user.entity';
import { Cv } from '../../../src/cv/entities/cv.entity';
import { Skill } from '../../../src/skill/entities/skill.entity';
import { SeedEntityConfig } from './seed-entity-config';
import {
  randEmail,
  randFirstName,
  randFullName,
  randJobTitle,
  randNumber,
  randPassword,
  randUrl,
  randWord,
} from '@ngneat/falso';
import { Role } from '../../../src/user/enums/role.enum';

@Injectable()
export class SeederService {
  constructor(private readonly dataSource: DataSource) { }

  async seed(configs: SeedEntityConfig<any>[]) {
    for (const config of configs) {
      const data = await this.generateFakeData(config.factory, config.count);
      await this.saveEntityData(config.entity, data);
      console.log(`${config.entity.name} seeded with ${config.count} rows`);
    }
  }

  private async generateFakeData(
    factory: () => Promise<any> | any,
    count: number,
  ) {
    return Promise.all(
      Array.from({ length: count }).map(() => factory())
    );
  }

  private async saveEntityData(entity: any, data: any[]) {
    const repository: Repository<any> =
      this.dataSource.getRepository(entity);
    await repository.save(data);
  }

  // User Factory
  createFakeUser() {
    return {
      username: randFullName(),
      email: randEmail(),
      password: randPassword(),
      salt: randWord(),
      role: Role.USER,
    };
  }
  // Skill Factory
  createFakeSkill() {
    return {
      designation: randWord(),
    };
  }

  // CV Factory
  async createFakeCv() {

    const userRepository = this.dataSource.getRepository(User);
    const skillRepository = this.dataSource.getRepository(Skill);
    const cvRepository = this.dataSource.getRepository(Cv);

    // Retrieve users and pick one randomly
    const users = await userRepository.find();
    const user = this.randFromArray(users)[0];

    // Retrieve skills and pick three at random
    const skills = await skillRepository.find();
    const randomSkills = this.randFromArray(skills, 3);

    // Create the CV using the cvRepository's creation method
    const cv = cvRepository.create({
      name: randFullName(),
      firstname: randFirstName(),
      age: randNumber({ min: 18, max: 60 }),
      cin: randNumber({ min: 10000000, max: 99999999 }),
      job: randJobTitle(),
      path: randUrl(),
      user,
      skills: randomSkills,
    });
    await cvRepository.save(cv);
    return cv;
  }
  // Utility function to pick random elements from an array
  private randFromArray<T>(array: T[], count: number = 1): T[] {
    const randomItems: T[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * array.length);
      randomItems.push(array[randomIndex]);
    }
    return randomItems;
  }


}
