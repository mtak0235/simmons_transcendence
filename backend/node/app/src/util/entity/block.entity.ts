import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import Users from '@entity/user.entity';

@Entity('blocks')
export default class Blocks {
  @PrimaryColumn()
  sourceId: number;

  @PrimaryColumn()
  targetId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.blockSourceUsers)
  @JoinColumn({ name: 'sourceId', referencedColumnName: 'id' })
  sourceUsers: Users;

  @ManyToOne(() => Users, (users) => users.blockTargetUsers)
  @JoinColumn({ name: 'targetId', referencedColumnName: 'id' })
  targetUsers: Users;
}
