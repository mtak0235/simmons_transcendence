import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import Follows from '@entity/follow.entity';

@Injectable()
export default class FollowRepository extends Repository<Follows> {
  constructor(private readonly dataSource: DataSource) {
    super(Follows, dataSource.createEntityManager());
  }

  findFolloweeList(userId: number): Promise<Follows[] | null> {
    const query = this.createQueryBuilder('follows').where(
      'follows.sourceId = :sourceId',
      { sourceId: userId },
    );
    return query.getMany();
  }

  findFollowerList(userId: number): Promise<Follows[] | null> {
    const query = this.createQueryBuilder('follows').where(
      'follows.targetId = :targetId',
      { targetId: userId },
    );
    return query.getMany();
  }
}
