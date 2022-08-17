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

  @ManyToOne(() => Users, (users) => users.blockSourceUsers)
  @JoinColumn({ name: 'sourceId', referencedColumnName: 'id' })
  sourceUsers: Users;

  @ManyToOne(() => Users, (users) => users.blockTargetUsers)
  @JoinColumn({ name: 'targetId', referencedColumnName: 'id' })
  targetUsers: Users;
}
