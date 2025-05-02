// src/cv-history/entities/cv-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  

  @Column()
  actionType: 'CREATE' | 'UPDATE' | 'DELETE';

  @Column()
  performedBy: string;

  @CreateDateColumn()
  doneAt: Date;
}
