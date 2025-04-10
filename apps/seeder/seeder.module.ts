import { Module } from '@nestjs/common';
import { SeederService } from './seeders/seeder.service';
import { SharedConfigModule } from '../../config/config.module';
@Module({
    imports: [
        SharedConfigModule
    ],
    providers: [SeederService]
})
export class SeederModule { }
