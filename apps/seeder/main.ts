import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeders/seeder.service';
import { SeedEntityConfig } from './seeders/seed-entity-config';
import { User } from '../../src/user/entities/user.entity';
import { Cv } from '../../src/cv/entities/cv.entity';
import { Skill } from '../../src/skill/entities/skill.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seeder = app.get(SeederService);

  const seedConfigs: SeedEntityConfig<any>[] = [
    {
      entity: User,
      factory: () => seeder.createFakeUser(),
      count: 10,
    },
    {
      entity: Skill,
      factory: () => seeder.createFakeSkill(),
      count: 5,
    },
    {
      entity: Cv,
      factory: seeder.createFakeCv.bind(seeder),
      count: 20,
    },
  ];

  await seeder.seed(seedConfigs);
  await app.close();
}
bootstrap();
