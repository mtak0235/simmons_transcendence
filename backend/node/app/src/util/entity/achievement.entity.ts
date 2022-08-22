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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => UserAchievements,
    (userAchievements) => userAchievements.achievements,
  )
  userAchievements: UserAchievements[];
}
