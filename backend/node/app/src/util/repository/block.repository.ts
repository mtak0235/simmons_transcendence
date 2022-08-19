import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import Blocks from '@entity/block.entity';

@Injectable()
export default class BLockRepository extends Repository<Blocks> {
  constructor(private readonly dataSource: DataSource) {
    super(Blocks, dataSource.createEntityManager());
  }
}
