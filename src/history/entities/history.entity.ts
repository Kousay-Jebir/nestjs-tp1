// src/history/history.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { EntityType } from '../enum/entity-type.enum';
import { ActionTypeEnum } from '../enum/action-type.enum';
import { User } from 'src/user/entities/user.entity';

@Entity('history')
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: EntityType })
  entityType: EntityType;

  @Column()
  entityId: number;

  @Column({ type: 'enum', enum: ActionTypeEnum })
  action: ActionTypeEnum;

  @ManyToOne(() => User, user => user.histories, { nullable: false })
  @JoinColumn({ name: 'performedByUserId' })
  performedBy: User;

  @Column()
  performedByUserId: number;

  @CreateDateColumn()
  timestamp: Date;
}
