import { ForbiddenException, Injectable } from '@nestjs/common';

import {
  ChannelDto,
  GameBallInfoDto,
  GameInfoDto,
} from '@socket/dto/channel.socket.dto';

import GameLogRepository from '@repository/game.log.repository';

@Injectable()
export class GameSocketService {
  private readonly rowSize = 10;
  private readonly colSize = 20;
  private readonly upKey = 38;
  private readonly downKey = 40;
  private readonly paddle = [0, 1, 2]; //[...Array(3)].map((_, pos) => pos);

  constructor(private readonly gameLogRepository: GameLogRepository) {}

  initialGameSetting(channel: ChannelDto) {
    channel.channelPublic.onGame = true;
    this.resetRoundSetting(channel, true);
  }

  resetRoundSetting(channel: ChannelDto, init = false) {
    if (!init) channel.gameInfo.round = channel.gameInfo.round + 1;
    channel.gameInfo.onRound = true;
    channel.gameInfo.ball = {
      pos: Math.round((10 * 20) / 2) + 10,
      speed: 200,
      deltaX: 1,
      deltaY: -this.colSize,
    };
    channel.channelPrivate.matcher.map((user, idx) => {
      channel.gameInfo.matcher[idx] = {
        userId: user.userId,
        pos: this.paddle.map(
          (x) => (x + idx) * this.colSize + (!idx ? 1 : -1) * (idx + 1),
        ),
        score: init ? 0 : channel.gameInfo.matcher[idx].score,
      };
    });
  }

  monitGame(channel: ChannelDto): boolean {
    // console.log(channel.gameInfo);
    return !(
      channel.channelPrivate.matcher.length !== 2 ||
      channel.channelPublic.score ===
        Math.max(...channel.gameInfo.matcher.map((matcher) => matcher.score))
    );
  }

  monitRound(ball: GameBallInfoDto): boolean {
    return !(
      (ball.deltaX === -1 && ball.pos % this.colSize === 0) ||
      (ball.deltaX === 1 && (ball.pos + 1) % this.colSize === 0)
    );
  }

  isBallTouchingEdge(newPos: number): boolean {
    return (
      (0 <= newPos && newPos < this.colSize) ||
      (this.colSize * (this.rowSize - 1) <= newPos &&
        newPos < this.colSize * this.rowSize)
    );
  }

  isBallTouchingPaddleEdge(gameInfo: GameInfoDto, newPos: number): boolean {
    return (
      gameInfo.matcher.findIndex(
        (user) => user.pos[0] === newPos || user.pos[2] === newPos,
      ) !== -1
    );
  }

  isBallTouchingPaddle(gameInfo: GameInfoDto, newPos: number): boolean {
    return (
      gameInfo.matcher.findIndex(
        (user) =>
          user.pos.indexOf(newPos) !== -1 ||
          (gameInfo.ball.deltaX === -1 &&
            user.pos.indexOf(newPos + gameInfo.ball.deltaX) !== -1),
      ) !== -1
    );
  }

  moveBall(gameInfo: GameInfoDto) {
    const newPos =
      gameInfo.ball.pos + gameInfo.ball.deltaY + gameInfo.ball.deltaX;

    if (this.isBallTouchingEdge(newPos)) {
      gameInfo.ball.deltaY *= -1;
    }
    if (this.isBallTouchingPaddleEdge(gameInfo, newPos)) {
      gameInfo.ball.deltaY *= -1;
    }
    if (this.isBallTouchingPaddle(gameInfo, newPos)) {
      gameInfo.ball.deltaX *= -1;
    }

    gameInfo.ball.pos = newPos;
  }

  movePaddle(
    gameInfo: GameInfoDto,
    userId: number,
    keyCode: number,
    userIdx: number,
  ): number[] {
    if (userId !== gameInfo.matcher[userIdx].userId)
      throw new ForbiddenException();

    const matcher = gameInfo.matcher[userIdx];
    const edge = keyCode === this.upKey ? matcher.pos[0] : matcher.pos[2];
    if (
      (keyCode === this.upKey && matcher.pos[0] - this.colSize < 0) ||
      (keyCode === this.downKey &&
        matcher.pos[2] + this.colSize > this.colSize * this.rowSize)
    )
      return matcher.pos;

    if (keyCode === this.upKey) {
      matcher.pos.unshift(edge - this.colSize);
      matcher.pos.pop();
    } else {
      matcher.pos.shift();
      matcher.pos.push(edge + this.colSize);
    }

    return matcher.pos;
  }

  async endGame(channel: ChannelDto) {
    if (
      channel.gameInfo.gameInterval &&
      !channel.gameInfo.gameInterval['_destroyed']
    )
      clearInterval(channel.gameInfo.gameInterval);
    if (
      channel.gameInfo.gameInterval &&
      !channel.gameInfo.roundInterval['_destroyed']
    )
      clearInterval(channel.gameInfo.roundInterval);

    channel.channelPublic.onGame = false;

    const logs = this.gameLogRepository.create({
      playerAId: channel.gameInfo.matcher[0].userId,
      playerBId: channel.gameInfo.matcher[1].userId,
      resultA: channel.gameInfo.matcher[0].score,
      resultB: channel.gameInfo.matcher[1].score,
    });
    await this.gameLogRepository.save(logs);

    channel.channelPrivate.matcher.length = 0;

    if (channel.channelPrivate.waiter.length > 0) {
      channel.channelPrivate.waiter.map((userId, idx) => {
        if (idx < 2) {
          channel.channelPrivate.matcher[idx] = {
            userId: userId,
            isReady: false,
          };
        }
      });
      channel.channelPrivate.waiter.splice(
        0,
        channel.channelPrivate.matcher.length,
      );
    }
  }

  endRound(gameInfo: GameInfoDto) {
    if (gameInfo.ball.deltaX !== -1) {
      gameInfo.matcher[0].score++;
    } else {
      gameInfo.matcher[1].score++;
    }
    console.log(gameInfo);

    setTimeout(() => {
      gameInfo.onRound = false;
    }, 2000);
  }
}
