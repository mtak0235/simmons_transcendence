import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import Follows from '@entity/follow.entity';
import Blocks from '@entity/block.entity';
import GameLogs from '@entity/game.log.entity';
import UserAchievements from '@entity/user.achievement.entity';

@Entity('users')
export default class Users {
  @PrimaryColumn()
  id: number;

  @Column('varchar', { length: 10 })
  username: string;

  @Column('varchar', { length: 20, nullable: true })
  displayName: string;

  @Column('varchar', { length: 100 })
  email: string;

  @Column('varchar', { length: 255 })
  imagePath: string;

  @Column('boolean', { default: true })
  firstAccess: boolean;

  @Column('boolean', { default: false })
  twoFactor: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @OneToMany(() => Follows, (follows) => follows.sourceUsers, { cascade: true })
  followSourceUsers: Follows[];

  @OneToMany(() => Follows, (follows) => follows.targetUsers, { cascade: true })
  followTargetUsers: Follows[];

  @OneToMany(() => Blocks, (blocks) => blocks.sourceUsers, { cascade: true })
  blockSourceUsers: Blocks[];

  @OneToMany(() => Blocks, (blocks) => blocks.targetUsers, { cascade: true })
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

  static builder(userBuilder: UsersBuilder) {
    const user = new Users();
    user.username = userBuilder._username;
    user.email = userBuilder._email;
    user.displayName = userBuilder._displayName;
    user.imagePath = userBuilder._imagePath;
    user.twoFactor = userBuilder._twoFactor;
    return user;
  }
}

export class UsersBuilder {
  public _username: string;
  public _displayName: string;
  public _email: string;
  public _imagePath: string;
  public _twoFactor: boolean;
  username(value: string) {
    this._username = value;
    return this;
  }

  displayName(value: string) {
    this._displayName = value;
    return this;
  }

  email(value: string) {
    this._email = value;
    return this;
  }

  imagePath(value: string) {
    this._imagePath = value;
    return this;
  }

  twoFactor(value: boolean) {
    this._twoFactor = value;
    return this;
  }
  build() {
    return Users.builder(this);
  }
}
