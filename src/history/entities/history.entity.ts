// src/cv-history/entities/cv-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToMany, ManyToOne } from 'typeorm';
import { ActionTypeEnum } from '../enum/action-type.enum';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityId: number;


  

  @Column({type:'enum',enum:ActionTypeEnum})
  actionType: ActionTypeEnum;

  @ManyToOne(()=>User,user=>user.history)
  performedBy: User;

  @CreateDateColumn()
  doneAt: Date;
}
