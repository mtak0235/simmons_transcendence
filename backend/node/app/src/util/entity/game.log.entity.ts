import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Users from '@entity/user.entity';

@Entity('game_logs')
export default class GameLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  playerAId: number;

  @Column('integer')
  playerBId: number;

  @Column('smallint')
  result: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.gameLogPlayerA, { nullable: false })
  @JoinColumn({ name: 'playerAId', referencedColumnName: 'id' })
  playerA: Users;

  @ManyToOne(() => Users, (users) => users.gameLogPlayerB, { nullable: false })
  @JoinColumn({ name: 'playerBId', referencedColumnName: 'id' })
  playerB: Users;

  // static builder(gameLogsBuilder: GameLogsBuilder) {
  //   const log = new GameLogs();
  //   log.playerAId = gameLogsBuilder.playerAId;
  //   log.playerBId = gameLogsBuilder.playerBId;
  //   log.result = gameLogsBuilder.result;
  //   return log;
  // }
}

// export class GameLogsBuilder {
//   get result(): any {
//     return this._result;
//   }
//
//   set result(value: number) {
//     this._result = value;
//   }
//   playerAId: number;
//   playerBId: number;
//   private _result: number;
// }
