import React, { useEffect, useRef, useState } from "react";
import Box, { BACKGROUND, BALL, PLAYER } from "./components/box";

/* size */
const ROW_SIZE: number = 10;
const COL_SIZE: number = 20;

/* paddle */
const PADDLE_BOARD_SIZE: number = 3;
const PADDLE_EDGE_SPACE: number = 1;

/* buttons */
const PLAYER_UP: number = 38; // up arrow
const PLAYER_DOWN: number = 40; // down arrow
const PAUSE: number = 32; // space

const inner = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "justify",
};

const outer = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "justify",
  marginTop: "9em",
  marginLeft: "25em",
  Text: "100px",
  padding: "10px",
};
const dividerStyle = {
  marginLeft: "50px",
  fontSize: "50px",
  color: "white",
};

const score = {
  marginLeft: "100px",
  fontSize: "50px",
  color: "white",
};

const style = {
  width: "250px",
  heigth: "250px",
  display: "grid",
  gridTemplate: `repeat(${ROW_SIZE}, 1fr) / repeat(${COL_SIZE}, 1fr)`,
};

/*
 * 1. 키 down시 시
 * */

const GamePlay = () => {
  const gameDoing = useRef(null);
  const paddle = [...Array(PADDLE_BOARD_SIZE)].map((_, pos) => pos);
  const [playerA, setPlayerA] = useState(
    paddle.map((x) => x * COL_SIZE + PADDLE_EDGE_SPACE)
  );
  const [playerB, setPlayerB] = useState(
    paddle.map((x) => (x + 1) * COL_SIZE - (PADDLE_EDGE_SPACE + 1))
  );
  const [ball, setBall] = useState(
    Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE
  );
  const [ballSpeed, setBallSpeed] = useState(200);
  const [deltaY, setDeltaY] = useState<number>(-COL_SIZE);
  const [deltaX, setDeltaX] = useState(-1);
  const [pause, setPause] = useState(true);
  const [playerBSpeed, setPlayerBSpeed] = useState(150);
  const [playerBDir, setPlayerBDir] = useState(false);
  const [playerAScore, setPlayerAScore] = useState(0);
  const [playerBScore, setPlayerBScore] = useState(0);

  const resetGame = () =>
    setBall(Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE);

  const moveBoard = (playerBoard, isUp: boolean) => {
    const playerEdge = isUp
      ? playerBoard[0]
      : playerBoard[PADDLE_BOARD_SIZE - 1];

    if (!touchingEdge(playerEdge)) {
      const deltaY = isUp ? -COL_SIZE : COL_SIZE;
      /* if ball touches the edge */
      const newDir = (deltaY !== COL_SIZE) !== isUp ? -deltaY : deltaY;

      if (!touchingEdge(ball)) {
        switch (ball) {
          case playerEdge + deltaY - 1:
            setDeltaX(newDir);
            setDeltaY(-1);
            break;
          case playerEdge:
            setDeltaY(newDir);

            break;
          case playerEdge + deltaY + 1:
            setDeltaX(newDir);
            setDeltaY(1);

            break;
        }
      }
      return playerBoard.map((x) => x + deltaY);
    }
    return false;
  };

  const componentDidMount = () => {
    /* moving the ball */
    // document.onkeydown = keyInput;
    // document.title = "ping-pong";
    setInterval(() => {
      if (!pause) {
        bounceBall();
      }
    }, ballSpeed);
    /* moving the opponent */
    setInterval(() => {
      if (!pause) {
        moveOpponent();
      }
    }, playerBSpeed);
  };

  useEffect(() => {
    componentDidMount();
  }, []);

  useEffect(() => {
    console.log(pause);
    const ball = setInterval(() => {
      if (!pause) {
        bounceBall();
      } else clearInterval(ball);
    }, ballSpeed);
    /* moving the opponent */
    const player = setInterval(() => {
      if (!pause) {
        moveOpponent();
      } else clearInterval(player);
    }, playerBSpeed);
  }, [pause]);

  const touchingEdge = (pos) =>
    (0 <= pos && pos < COL_SIZE) ||
    (COL_SIZE * (ROW_SIZE - 1) <= pos && pos < COL_SIZE * ROW_SIZE);

  const touchingPaddle = (pos) => {
    return (
      playerA.indexOf(pos) !== -1 ||
      playerB.indexOf(pos) !== -1 ||
      (deltaX === -1 && playerA.indexOf(pos + deltaX) !== -1) ||
      (deltaX === -1 && playerB.indexOf(pos + deltaX) !== -1)
    );
  };

  const isScore = (pos) =>
    (deltaX === -1 && pos % COL_SIZE === 0) ||
    (deltaX === 1 && (pos + 1) % COL_SIZE === 0);

  const moveOpponent = () => {
    const movedPlayer = moveBoard(playerB, playerBDir);
    movedPlayer ? setPlayerB(movedPlayer) : setPlayerBDir(!playerBDir);
  };

  const touchingPaddleEdge = (pos) =>
    playerA[0] === pos ||
    playerA[PADDLE_BOARD_SIZE - 1] === pos ||
    playerB[0] === pos ||
    playerB[PADDLE_BOARD_SIZE - 1] === pos;

  const bounceBall = () => {
    const newState = ball + deltaY + deltaX;
    // console.log(ball, newState);
    if (touchingEdge(newState)) {
      setDeltaY(-deltaY);
    }

    if (touchingPaddleEdge(newState)) {
      setDeltaY(-deltaY);
    }

    if (touchingPaddle(newState)) {
      setDeltaX(-deltaX);
    }

    /* updating board */
    setBall(newState);

    /* checking if loss or won */
    if (isScore(newState)) {
      if (deltaX !== -1) {
        /* player won */
        setPlayerAScore(playerAScore + 1);
        setBall(newState);
      } else {
        /* opponent won */
        setPlayerBScore(playerBScore + 1);
        setBall(newState);
      }
      setPause(true);
      resetGame();
    }
  };

  const keyInput = (e) => {
    e.preventDefault();
    const keyCode = e.keyCode;
    console.log(keyCode);
    if (keyCode !== 40 && keyCode !== 38 && keyCode !== 32) return;
    switch (e.keyCode) {
      case 40:
      case 38:
        const movedPlayer = moveBoard(playerA, keyCode === 38);
        if (movedPlayer) {
          setPlayerA(movedPlayer);
          setPause(false);
        }
        break;
      case 32:
        setPause(true);
        break;
    }
  };

  const board = [...Array(ROW_SIZE * COL_SIZE)].map((_, pos) => {
    let val = BACKGROUND;
    if (playerA.indexOf(pos) !== -1 || playerB.indexOf(pos) !== -1) {
      val = PLAYER;
    } else if (ball === pos) {
      val = BALL;
    }
    return <Box key={pos} k={pos} name={val} />;
  });

  const divider = [...Array(ROW_SIZE / 2 + 2)].map((_) => <div>{"|"}</div>);
  return (
    <div
      // onKeyDown={keyInput}
      // tabIndex={0}
      onClick={(e) => {
        const { current }: any = gameDoing;
        current.focus();
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <input
        style={{
          border: "none",
          cursor: "default",
          textAlign: "center",
          outline: "none",
        }}
        onKeyDown={keyInput}
        readOnly
        ref={gameDoing}
      ></input>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "justify",
          marginTop: "9em",
          marginLeft: "25em",
          textSizeAdjust: "100px",
          padding: "10px",
        }}
      >
        <h1>
          {" "}
          {"[space]"} {pause ? "PLAY/pause" : "play/PAUSE"}{" "}
        </h1>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "justify",
          }}
        >
          <div style={style}>{board}</div>
          <div style={score}>{playerAScore}</div>
          <div style={dividerStyle}> {divider} </div>
          <div style={dividerStyle}>{playerBScore}</div>
        </div>
        <h3> {"press up and down to move"} </h3>
      </div>
    </div>
  );
};

window.addEventListener(
  "keydown",
  (e) => {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
        e.code
      )
    ) {
      e.preventDefault();
    }
  },
  false
);

export default GamePlay;
