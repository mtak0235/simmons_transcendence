import React, { useEffect, useRef, useState } from "react";
import Box, { BACKGROUND, BALL, PLAYER } from "./components/box";
import { useRecoilValue } from "recoil";
import RecoilSelector from "@infrastructure/recoil/RecoilSelector";
import ISocketEmit from "@domain/socket/ISocketEmit";
import Get from "@root/lib/di/get";
import styled from "styled-components";

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

const Column = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
`;

const Score = styled.div`
  font-size: 15px;
  color: red;
`;

/*
 * 1. 키 down시 시
 * */

const GamePlay = () => {
  const socketEmit: ISocketEmit = Get.get("ISocketEmit");
  const gameDoing = useRef(null);
  const divider = [...Array(ROW_SIZE / 2 + 2)].map((_) => <div>{"|"}</div>);
  const me = useRecoilValue(RecoilSelector.user.me);
  const matchers = useRecoilValue(RecoilSelector.game.matcher);
  const ball = useRecoilValue(RecoilSelector.game.ball);
  const [playerA, setPlayerA] = useState(matchers[0]);
  const [playerB, setPlayerB] = useState(matchers[1]);

  useEffect(() => {
    setPlayerA(matchers[0]);
    setPlayerB(matchers[1]);
  }, [matchers]);

  // useEffect(() => {
  //   return () => {
  //     socketEmit.outChannel();
  //   };
  // }, []);

  const handleKeyInput = (e) => {
    e.preventDefault();

    const keyCode = e.keyCode;
    const myIdx = matchers.findIndex((user) => user.userId === me.userId);

    if (myIdx === -1 || (keyCode !== 40 && keyCode !== 38)) return;

    socketEmit.inputKey({
      keyCode: keyCode,
      userIdx: myIdx,
    });
  };

  const board = [...Array(ROW_SIZE * COL_SIZE)].map((_, pos) => {
    let val = BACKGROUND;
    if (playerA.pos.indexOf(pos) !== -1 || playerB.pos.indexOf(pos) !== -1) {
      val = PLAYER;
    } else if (ball === pos) {
      val = BALL;
    }
    return <Box key={pos} k={pos} name={val} />;
  });

  return (
    <Column
      onClick={(e) => {
        const { current }: any = gameDoing;
        current.focus();
      }}
    >
      <input
        style={{
          border: "none",
          cursor: "default",
          textAlign: "center",
          outline: "none",
          backgroundColor: "transparent",
        }}
        onKeyDown={handleKeyInput}
        readOnly
        ref={gameDoing}
      ></input>
      <Row>
        <Score>{playerA.score}</Score>
        <Score>{playerB.score}</Score>
      </Row>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "justify",
          textSizeAdjust: "100px",
          padding: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "justify",
          }}
        >
          <div style={style}>{board}</div>
        </div>
        <h3> {"press up and down to move"} </h3>
      </div>
    </Column>
    // <div
    //   // onKeyDown={keyInput}
    //   // tabIndex={0}
    //
    //   style={{ width: "100%", height: "100%" }}
    // >
    //   <input
    //     style={{
    //       border: "none",
    //       cursor: "default",
    //       textAlign: "center",
    //       outline: "none",
    //     }}
    //     onKeyDown={handleKeyInput}
    //     readOnly
    //     ref={gameDoing}
    //   ></input>
    //   <div
    //     style={{
    //       display: "flex",
    //       flexDirection: "column",
    //       justifyContent: "justify",
    //     }}
    //   >
    //     <div style={score}>{playerA.score}</div>
    //     <div style={dividerStyle}>{playerB.score}</div>
    //   </div>
    //   <div
    //     style={{
    //       display: "flex",
    //       flexDirection: "column",
    //       justifyContent: "justify",
    //       textSizeAdjust: "100px",
    //       padding: "10px",
    //     }}
    //   >
    //     <div
    //       style={{
    //         display: "flex",
    //         flexDirection: "row",
    //         justifyContent: "justify",
    //       }}
    //     >
    //       <div style={style}>{board}</div>
    //     </div>
    //     <h3> {"press up and down to move"} </h3>
    //   </div>
    // </div>
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
