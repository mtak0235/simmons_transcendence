import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import Users from '@entity/user.entity';

@Entity('follows')
export default class Follows {
  @PrimaryColumn()
  sourceId: number;

  @PrimaryColumn()
  targetId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.followSourceUsers)
  @JoinColumn({ name: 'sourceId', referencedColumnName: 'id' })
  sourceUsers: Users;

  @ManyToOne(() => Users, (users) => users.followTargetUsers)
  @JoinColumn({ name: 'targetId', referencedColumnName: 'id' })
  targetUsers: Users;
}
