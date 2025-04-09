import { Module } from '@nestjs/common';
import { SeederService } from './seeders/seeder.service';
@Module({
    providers: [SeederService]
})
export class SeederModule { }
