// src/cv-history/entities/cv-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ActionType } from '../enum/action-type.enum';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  

  @Column({type:'enum',enum:ActionType})
  actionType: ActionType;

  @Column()
  performedBy: string;

  @CreateDateColumn()
  doneAt: Date;
}
