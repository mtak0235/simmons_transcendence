import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import Follows from '@entity/follow.entity';

@Injectable()
export default class FollowRepository extends Repository<Follows> {
  constructor(private readonly dataSource: DataSource) {
    super(Follows, dataSource.createEntityManager());
  }
}
