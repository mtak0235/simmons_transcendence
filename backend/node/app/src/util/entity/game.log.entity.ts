import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Users from '@entity/user.entity';

@Entity('game_logs')
export default class GameLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  playerAId: number;

  @Column('integer')
  playerBId: number;

  @Column('smallint')
  result: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Users, (users) => users.gameLogPlayerA, { nullable: false })
  @JoinColumn({ name: 'playerAId', referencedColumnName: 'id' })
  playerA: Users;

  @ManyToOne(() => Users, (users) => users.gameLogPlayerB, { nullable: false })
  @JoinColumn({ name: 'playerBId', referencedColumnName: 'id' })
  playerB: Users;
}
