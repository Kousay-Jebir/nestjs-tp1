import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Skill } from 'src/skill/entities/skill.entity';

@Entity()
export class Cv {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    firstname: string;

    @Column()
    age: number;

    @Column({ type: 'int', unique: true })
    cin: number;

    @Column()
    job: string;

    @Column()
    path: string;

    @ManyToOne(() => User, (user) => user.cvs)
    user: User;

    @ManyToMany(() => Skill)
    @JoinTable()
    skills: Skill[];
}
