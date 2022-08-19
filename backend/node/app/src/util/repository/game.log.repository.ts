import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import GameLogs from '@entity/game.log.entity';

@Injectable()
export default class GameLogRepository extends Repository<GameLogs> {
  constructor(private readonly dataSource: DataSource) {
    super(GameLogs, dataSource.createEntityManager());
  }
}
