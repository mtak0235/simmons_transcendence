import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import UserAchievements from '@entity/user.achievement.entity';

@Entity('achievements')
export default class Achievements {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 20 })
  title: string;

  @Column('varchar', { length: 50 })
  content: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @OneToMany(
    () => UserAchievements,
    (userAchievements) => userAchievements.achievements,
  )
  userAchievements: UserAchievements[];

  static builder(achievementBuilder: AchievementBuilder) {
    const achievement = new Achievements();
    achievement.title = achievementBuilder._title;
    achievement.content = achievementBuilder._content;
    return achievement;
  }
}

export class AchievementBuilder {
  public _title: string;
  public _content: string;
  title(value: string) {
    this._title = value;
  }
  content(value: string) {
    this._content = value;
  }

  build() {
    return Achievements.builder(this);
  }
}
