import styled from "styled-components";
import { SizedBox } from "../components/TSDesign";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  flex-flow: row wrap;
  align-items: stretch;
`;

const GameScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 3;
  background-color: blue;
  height: calc(100vh - 100px);
`;

const ChattingScreen = styled.div`
  flex-grow: 1;
  background-color: yellow;
  height: calc(100vh - 100px);
`;

const UserBox = styled.div`
  width: 200px;
  height: 200px;
  background-color: red;
`;

function Game() {
  return (
    <Wrapper>
      <GameScreen>
        <UserBox></UserBox>
        <SizedBox width={50}></SizedBox>
        <UserBox></UserBox>
      </GameScreen>
      <ChattingScreen></ChattingScreen>
    </Wrapper>
  );
}
export default Game;
