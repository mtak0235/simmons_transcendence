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

  @CreateDateColumn()
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

  // static builder() {
  //   let userAchievement = new UserAchievement();
  //   userAchievement.userId =
  // }
}

// export class
