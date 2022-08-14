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
  target_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Users, (users) => users.blocks, { nullable: false })
  @JoinColumn([
    { name: 'sourceId', referencedColumnName: 'id' },
    { name: 'targetId', referencedColumnName: 'id' },
  ])
  users: Users;
}
