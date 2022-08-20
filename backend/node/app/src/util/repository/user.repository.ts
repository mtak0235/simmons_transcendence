import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import Users from '@entity/user.entity';

@Injectable()
export default class UserRepository extends Repository<Users> {
  constructor(private readonly dataSource: DataSource) {
    super(Users, dataSource.createEntityManager());
  }

  async findUser(column: string, value: any, operator = '=') {
    const query = this.createQueryBuilder('users').where(
      `users.${column} ${operator} :value`,
      {
        value: value,
      },
    );
    return await query.getOne();
  }
}
