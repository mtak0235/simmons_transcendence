import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import Users from '@entity/user.entity';

@Injectable()
export default class UserRepository extends Repository<Users> {
  constructor(private readonly dataSource: DataSource) {
    super(Users, dataSource.createEntityManager());
  }

  async findUserForUsername(username: string) {
    const query = this.createQueryBuilder('users').where(
      'users.username = :username',
      {
        username: username,
      },
    );
    return await query.getOne();
  }
}
