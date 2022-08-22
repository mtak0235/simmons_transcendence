import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import Follows from '@entity/follow.entity';
import Blocks from '@entity/block.entity';
import GameLogs from '@entity/game.log.entity';
import UserAchievements from '@entity/user.achievement.entity';

@Entity('users')
export default class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 10 })
  username: string;

  @Column('varchar', { length: 20 })
  displayName: string;

  @Column('varchar', { length: 100 })
  email: string;

  @Column('varchar', { length: 255, default: '' }) // todo: update: default local path
  imagePath: string;

  @Column('boolean', { default: false })
  twoFactor: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Follows, (follows) => follows.sourceUsers)
  followSourceUsers: Follows[];

  @OneToMany(() => Follows, (follows) => follows.targetUsers)
  followTargetUsers: Follows[];

  @OneToMany(() => Blocks, (blocks) => blocks.sourceUsers)
  blockSourceUsers: Blocks[];

  @OneToMany(() => Blocks, (blocks) => blocks.targetUsers)
  blockTargetUsers: Blocks[];

  @OneToMany(() => GameLogs, (gameLogs) => gameLogs.playerA)
  gameLogPlayerA: GameLogs[];

  @OneToMany(() => GameLogs, (gameLogs) => gameLogs.playerB)
  gameLogPlayerB: GameLogs[];

  @OneToMany(
    () => UserAchievements,
    (userAchievements) => userAchievements.users,
  )
  userAchievements: UserAchievements[];
}
