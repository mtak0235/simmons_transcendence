import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import Achievements from '@entity/achievement.entity';

@Injectable()
export default class AchievementRepository extends Repository<Achievements> {
  constructor(private readonly dataSource: DataSource) {
    super(Achievements, dataSource.createEntityManager());
  }
}
