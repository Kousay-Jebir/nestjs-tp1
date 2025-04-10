import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../src/user/entities/user.entity';
import { Cv } from '../../../src/cv/entities/cv.entity';
import { Skill } from '../../../src/skill/entities/skill.entity';
import { randEmail, randFirstName, randFullName, randJobTitle, randNumber, randPassword, randUrl, randWord } from '@ngneat/falso';

@Injectable()
export class SeederService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Cv) private cvRepository: Repository<Cv>,
        @InjectRepository(Skill) private skillRepository: Repository<Skill>,
    ) { }

    async seed() {
        await this.seedEntities([
            {
                entity: User,
                factory: this.createFakeUser,
                count: 10,
            },
            {
                entity: Skill,
                factory: this.createFakeSkill,
                count: 5,
            },
            {
                entity: Cv,
                factory: this.createFakeCv.bind(this),
                count: 20,
            },
        ]);
    }

    private async seedEntities(entitiesConfig: Array<any>) {
        for (const config of entitiesConfig) {
            const { entity, factory, count } = config;
            const data = await this.generateFakeData(factory, count);
            await this.saveEntityData(entity, data);
            console.log(`${entity.name} seeded`);
        }
    }

    private async generateFakeData(factory: Function, count: number) {
        return Promise.all(Array.from({ length: count }).map(() => factory()));
    }

    private async saveEntityData(entity: any, data: any[]) {
        await this[`${entity.name.toLowerCase()}Repository`].save(data);
    }

    // User Factory
    private createFakeUser() {
        return {
            username: randFullName(),
            email: randEmail(),
            password: randPassword(),
        };
    }

    // Skill Factory
    private createFakeSkill() {
        return {
            designation: randWord(),
        };
    }

    // CV Factory
    private async createFakeCv() {
        const users = await this.userRepository.find();
        const user = this.randFromArray(users)[0];

        const skills = await this.skillRepository.find();
        const randomSkills = this.randFromArray(skills, 3);

        // Create the CV
        const cv = this.cvRepository.create({
            name: randFullName(),
            firstname: randFirstName(),
            age: randNumber({ min: 18, max: 60 }),
            cin: randNumber({ length: 8 })[0],
            job: randJobTitle(),
            path: randUrl(),
            user,
            skills: randomSkills,
        });
        await this.cvRepository.save(cv);
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
