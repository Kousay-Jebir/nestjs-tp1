import { Module } from '@nestjs/common';
import { SeederService } from './seeders/seeder.service';
import { SharedConfigModule } from '../../config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../src/user/entities/user.entity';
import { Cv } from '../../src/cv/entities/cv.entity';
import { Skill } from '../../src/skill/entities/skill.entity';

@Module({
  imports: [
    SharedConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [SharedConfigModule],
      useFactory: (configService: ConfigService) => {
        const typeOrmConfig = configService.get('typeorm');

        if (!typeOrmConfig) {
          throw new Error('TypeORM configuration is missing');
        }

        return typeOrmConfig;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Cv, Skill]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
