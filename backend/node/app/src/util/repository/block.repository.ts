import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import Blocks from '@entity/block.entity';

@Injectable()
export default class BLockRepository extends Repository<Blocks> {
  constructor(private readonly dataSource: DataSource) {
    super(Blocks, dataSource.createEntityManager());
  }

  findBlockList(userId: number): Promise<Blocks[] | null> {
    const query = this.createQueryBuilder('blocks').where(
      'blocks.sourceId = :sourceId',
      { sourceId: userId },
    );
    return query.getMany();
  }

  findBlockedList(userId: number): Promise<Blocks[] | null> {
    const query = this.createQueryBuilder('blocks').where(
      'blocks.targetId = :targetId',
      { targetId: userId },
    );
    return query.getMany();
  }
}
