import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import Users from '@util/entity/user.entity';

@Entity('blocks')
export default class Blocks {
  @PrimaryColumn()
  sourceId: number;

  @PrimaryColumn()
  targetId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Users, (users) => users.follows)
  @JoinColumn()
  users: Users;
}
