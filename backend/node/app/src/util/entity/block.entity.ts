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

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.blockSourceUsers)
  @JoinColumn({ name: 'sourceId', referencedColumnName: 'id' })
  sourceUsers: Users;

  @ManyToOne(() => Users, (users) => users.blockTargetUsers)
  @JoinColumn({ name: 'targetId', referencedColumnName: 'id' })
  targetUsers: Users;

  // static builder(blockBuilder: BlockBuilder) {
  //   const blocks = new Blocks();
  //   blocks.targetId = blockBuilder._targetId;
  //   blocks.sourceId = blockBuilder._sourceId;
  //   return blocks;
  // }
}

// export class BlockBuilder {
//   public _targetId: number;
//   public _sourceId: number;
//   targetId(value: number) {
//     this._targetId = value;
//     return this;
//   }
//   sourceId(value: number) {
//     this._sourceId = value;
//     return this;
//   }
//   build() {
//     return Blocks.builder(this);
//   }
// }
