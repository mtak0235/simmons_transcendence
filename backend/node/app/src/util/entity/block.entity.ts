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
  sourceId: (value: number) => this;

  @PrimaryColumn()
  targetId: (value: number) => this;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.blockSourceUsers, {
    cascade: true,
  })
  @JoinColumn({ name: 'sourceId', referencedColumnName: 'id' })
  sourceUsers: Users;

  @ManyToOne(() => Users, (users) => users.blockTargetUsers, { cascade: true })
  @JoinColumn({ name: 'targetId', referencedColumnName: 'id' })
  targetUsers: Users;

  constructor(blockBuilder: BlockBuilder) {
    this.targetId(blockBuilder._targetId);
    this.sourceId(blockBuilder._sourceId);
  }
}

export class BlockBuilder {
  public _targetId: number;
  public _sourceId: number;
  targetId(value: number) {
    this._targetId = value;
    return this;
  }
  sourceId(value: number) {
    this._sourceId = value;
    return this;
  }
  build() {
    return new Blocks(this);
  }
}
