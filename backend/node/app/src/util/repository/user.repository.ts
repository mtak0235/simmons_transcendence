import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import Users from '@entity/user.entity';
import { UserAccessDto, UserUpdateDto } from '@user/user.dto';

@Injectable()
export default class UserRepository extends Repository<Users> {
  constructor(private readonly dataSource: DataSource) {
    super(Users, dataSource.createEntityManager());
  }

  findUser(column: string, value: any, operator = '='): Promise<Users | null> {
    const query = this.createQueryBuilder('users').where(
      `users.${column} ${operator} :value`,
      {
        value: value,
      },
    );
    return query.getOne();
  }

  async updateProfile(userId: number, userUpdateDto: UserUpdateDto) {
    await this.createQueryBuilder('users')
      .update(userUpdateDto)
      .where('users.id = :id', { id: userId })
      .execute();
  }

  async updateImagePath(userId: number, imagePath: string) {
    await this.createQueryBuilder('users')
      .update({ imagePath: imagePath })
      .where('users.id = :id', { id: userId })
      .execute();
  }

  async updateFirstAccess(userId: number, userAccessDto: UserAccessDto) {
    await this.createQueryBuilder('users')
      .update(userAccessDto)
      .where('users.id = :id', { id: userId })
      .execute();
  }
}
