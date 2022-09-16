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

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.followSourceUsers)
  @JoinColumn({ name: 'sourceId', referencedColumnName: 'id' })
  sourceUsers: Users;

  @ManyToOne(() => Users, (users) => users.followTargetUsers)
  @JoinColumn({ name: 'targetId', referencedColumnName: 'id' })
  targetUsers: Users;

  static builder(followBuilder: FollowBuilder) {
    const follow = new Follows();
    follow.targetId = followBuilder._targetId;
    follow.sourceId = followBuilder._sourceId;
    return follow;
  }
}

export class FollowBuilder {
  public _sourceId: number;
  public _targetId: number;

  sourceId(value: number) {
    this._sourceId = value;
  }

  targetId(value: number) {
    this._targetId = value;
  }

  build() {
    return Follows.builder(this);
  }
}
