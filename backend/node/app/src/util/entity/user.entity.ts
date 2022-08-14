import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import Follows from '@util/entity/follow.entity';
import Blocks from '@util/entity/block.entity';
import GameLogs from '@util/entity/game.log.entity';
import UserAchievements from '@util/entity/user.achievement.entity';

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

  @OneToMany(() => Follows, (follows) => follows.users)
  follows: Follows[];

  @OneToMany(() => Follows, (blocks) => blocks.users)
  blocks: Blocks[];

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
