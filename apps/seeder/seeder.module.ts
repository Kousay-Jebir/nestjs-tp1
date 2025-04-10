import { Module } from '@nestjs/common';
import { SeederService } from './seeders/seeder.service';
import { SharedConfigModule } from '../../config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

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

    ],
    providers: [SeederService]
})
export class SeederModule { }
