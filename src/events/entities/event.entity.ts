import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Cv } from '../../cv/entities/cv.entity';

export enum EventType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  PHOTO_UPDATE = 'photo_update',
}

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  type: EventType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Cv, { onDelete: 'CASCADE' })
  @JoinColumn()
  cv: Cv;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;
}
