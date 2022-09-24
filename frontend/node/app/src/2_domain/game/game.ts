/* size */
const ROW_SIZE = 10;
const COL_SIZE = 20;

/* paddle */
const PADDLE_BOARD_SIZE = 3;
const PADDLE_EDGE_SPACE = 1;

type GameParam = {
  player: number[];
  opponent: number[];
  ball: number;
  ballSpeed: number;
  deltaY: number;
  deltaX: number;
  pause: boolean;
  opponentSpeed: number;
  opponentDir: boolean;
  playerScore: number;
  opponentScore: number;
};

class Game {
  player: number[];
  opponent: number[];
  ball: number;
  ballSpeed: number;
  deltaY: number;
  deltaX: number;
  pause: boolean;
  opponentSpeed: number;
  opponentDir: boolean;
  playerScore: number;
  opponentScore: number;

  private constructor(param: GameParam) {
    this.player = param.player;
    this.opponent = param.opponent;
    this.ball = param.ball;
    this.ballSpeed = param.ballSpeed;
    this.deltaY = param.deltaY;
    this.deltaX = param.deltaX;
    this.pause = param.pause;
    this.opponentSpeed = param.opponentSpeed;
    this.opponentDir = param.opponentDir;
    this.playerScore = param.playerScore;
    this.opponentScore = param.opponentScore;
  }

  static initial = (): Game => {
    const paddle = [...Array(PADDLE_BOARD_SIZE)].map((_, pos) => pos);
    return new Game({
      player: paddle.map((x) => x * COL_SIZE + PADDLE_EDGE_SPACE),
      opponent: paddle.map((x) => (x + 1) * COL_SIZE - (PADDLE_EDGE_SPACE + 1)),
      ball: Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE,
      /* ball */
      ballSpeed: 100,
      deltaY: -COL_SIZE,
      deltaX: -1, // -1 means the ball is moving towards player 1 means towards opponent
      pause: true,
      /* for dumb Ai */
      opponentSpeed: 150,
      opponentDir: false,
      /* Score */
      playerScore: 0,
      opponentScore: 0,
    });
  };
}

export default Game;
