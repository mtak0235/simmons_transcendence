import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Users from '@util/entity/user.entity';

@Entity('game_logs')
export default class GameLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  playerAId: number;

  @Column('integer')
  playerBId: number;

  @Column('integer')
  result: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Users, (users) => users.gameLogs, { nullable: false })
  @JoinColumn()
  users: Users;
}
