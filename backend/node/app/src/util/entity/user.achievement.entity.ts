import {
  Entity,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

import Users from '@entity/user.entity';
import Achievements from '@entity/achievement.entity';

@Entity('user_achievements')
export default class UserAchievements {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  userId: number;

  @Column('integer')
  achievementId: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.userAchievements, {
    nullable: false,
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  users: Users;

  @ManyToOne(
    () => Achievements,
    (achievements) => achievements.userAchievements,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'achievementId', referencedColumnName: 'id' })
  achievements: Achievements;

  static builder(userAchievementBuilder: UserAchievementBuilder) {
    const userAchievement = new UserAchievements();
    userAchievement.userId = userAchievementBuilder._userId;
    userAchievement.achievementId = userAchievementBuilder._achievementId;
    return userAchievement;
  }
}

export class UserAchievementBuilder {
  public _userId: number;
  public _achievementId: number;
  userId(value: number) {
    this._userId = value;
    return this;
  }

  achievementId(value: number) {
    this._achievementId = value;
    return this;
  }

  build() {
    return UserAchievements.builder(this);
  }
}
