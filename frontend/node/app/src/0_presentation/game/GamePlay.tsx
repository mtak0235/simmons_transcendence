import { width } from "@mui/system";
import Box, { BACKGROUND, BALL, PLAYER } from "./components/box";
import { useUpdateGame } from "@root/1_application/game/useGamePlay";
import Game from "@root/2_domain/game/game";

/* size */
const ROW_SIZE: number = 10;
const COL_SIZE: number = 20;

/* paddle */
const PADDLE_BOARD_SIZE = 3;
const PADDLE_EDGE_SPACE = 1;

/* buttons */
const PLAYER_UP = "ArrowUp"; // up arrow
const PLAYER_DOWN = "ArrowDown"; // down arrow
const PAUSE = " "; // space

const GamePlay = () => {
  const game = useUpdateGame();
  const tmpGame = Game.initial();

  tmpGame.deltaX = 0;
  tmpGame.deltaY = 0;

  // useUpdateGame(tmpGame);

  console.log(game.deltaX, game.deltaY);

  // game.deltaX = 999;

  // console.log(game.deltaX, game.deltaY);

  // const { deltaY } = useGameSettings();

  document.onkeydown = (event) => {
    switch (event.key) {
      case PLAYER_UP:
      case PLAYER_DOWN:
        console.log(event.key);
        break;
      case PAUSE:
        console.log("Pause");
        break;
    }
  };

  const touchingEdge = (pos) =>
    (0 <= pos && pos < COL_SIZE) ||
    (COL_SIZE * (ROW_SIZE - 1) <= pos && pos < COL_SIZE * ROW_SIZE);

  // const moveBoard = (playerBoard, isUp) => {
  //   const playerEdge = isUp
  //     ? playerBoard[0]
  //     : playerBoard[PADDLE_BOARD_SIZE - 1];

  //   if (!touchingEdge(playerEdge)) {
  //     const deltaY = isUp ? -COL_SIZE : COL_SIZE;
  //     /* if ball touches the edge */
  //     const newDir = (deltaY != COL_SIZE) ^ isUp ? -deltaY : deltaY;

  //     if (!this.touchingEdge(ball)) {
  //       switch (this.state.ball) {
  //         case playerEdge + deltaY - 1:
  //           this.setState({
  //             deltaY: newDir,
  //             deltaX: -1,
  //           });
  //           break;
  //         case playerEdge:
  //           this.setState({
  //             deltaY: newDir,
  //           });
  //           break;
  //         case playerEdge + deltaY + 1:
  //           this.setState({
  //             deltaY: newDir,
  //             deltaX: 1,
  //           });
  //           break;
  //       }
  //     }
  //     return playerBoard.map((x) => x + deltaY);
  //   }
  //   return false;
  // };

  // const board = [...Array(ROW_SIZE * COL_SIZE)].map((_, pos) => {
  //   let val = BACKGROUND;
  //   if (player.indexOf(pos) !== -1 || opponent.indexOf(pos) !== -1) {
  //     val = PLAYER;
  //   } else if (state.ball === pos) {
  //     val = BALL;
  //   }
  //   return <Box key={pos} k={pos} name={val} />;
  // });

  // const paddle = [...Array(PADDLE_BOARD_SIZE)].map((_, pos) => pos);
  // const [player, setPlayer] = paddle.map(
  //   (x) => x * COL_SIZE + PADDLE_EDGE_SPACE
  // );
  // const [opponent, setOpponent] = paddle.map(
  //   (x) => x * COL_SIZE + PADDLE_EDGE_SPACE
  // );

  // const board = [...Array(ROW_SIZE * COL_SIZE)].map((_, pos) => {
  //   let val = BACKGROUND;
  //   if (
  //     this.state.player.indexOf(pos) !== -1 ||
  //     this.state.opponent.indexOf(pos) !== -1
  //   ) {
  //     val = PLAYER;
  //   } else if (this.state.ball === pos) {
  //     val = BALL;
  //   }
  //   return <Box key={pos} k={pos} name={val} />;
  // });
  return <div tabIndex={0} style={{ width: 200, height: 200 }}></div>;
};

export default GamePlay;
