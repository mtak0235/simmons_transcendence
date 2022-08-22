import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import UserAchievements from '@entity/user.achievement.entity';

@Injectable()
export default class UserAchievementRepository extends Repository<UserAchievements> {
  constructor(private readonly dataSource: DataSource) {
    super(UserAchievements, dataSource.createEntityManager());
  }
}
