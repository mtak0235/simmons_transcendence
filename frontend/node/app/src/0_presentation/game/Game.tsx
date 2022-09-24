import { Button, Input, Radio } from "antd";
import { Link } from "react-router-dom";
import styled from "styled-components";
import useGameLogs from "../../1_application/game/useGame";
import { useUserInfo } from "../../1_application/user/useUser";
import User from "../../2_domain/user/user";
import useModal from "../components/modal/hooks";
import { SizedBox } from "../components/TSDesign";
import { useRecoilState } from "recoil";
import { useRef, useState, useEffect } from "react";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  flex-flow: row wrap;
  align-items: stretch;
`;

const GameScreen = styled.div`
  display: flex;
  flex-grow: 3;
  background-color: lightyellow;
  height: calc(100vh - 100px);
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
`;

const GameScreenControl = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const GameWaitingQueue = styled.div`
  display: flex;
  width: 50%;
  height: 5%;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const WaitingUser = styled.div`
  display: flex;
  width: 20%;
  justify-content: center;
  border: 2px solid #969696;
`;

const ChattingScreen = styled.div`
  display: flex;
  flex-grow: 1;
  max-width: 300px;
  height: calc(100vh - 100px);
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const UserBox = styled.div`
  display: flex;
  width: 200px;
  height: 200px;
  background-color: white;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 10px;
  border-radius: 20px;
  box-shadow: 1px 1px;
`;

const UserBoxInfo = styled.div`
  font-size: 15px;
  font-weight: 400;
`;

const DialogueWindow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  background-color: green;
  height: 100%;
  width: 100%;
`;

const MessageBox = styled.div`
  display: inline-block;
  position: relative;
  width: 200px;
  height: auto;
  background-color: lightyellow;
`;

const Message = styled.div`
  padding: 1em;
  text-align: left;
  line-height: 1.5em;
`;

// function ChatRoom(nickName) {
//   const [messages] = useState([]);

//   return (
//     <>
//       {messages.map((message) => (
//         <MessageItem item={message} />
//       ))}
//       <MessageCreator />
//     </>
//   );
// }

function ChatRoom(nickName) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  let idx = useRef(0);
  const addItem = () => {
    console.log("here");
    setMessages((prev) => [...prev, inputValue]);
    setInputValue("");
  };

  const onChange = ({ target: { value } }) => {
    setInputValue(value);
  };

  return (
    <div>
      {messages.map((message) => (
        <MessageItem key={idx.current++} item={message} />
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={onChange}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            addItem();
          }
        }}
      />
      <button onClick={addItem}>Send</button>
    </div>
  );
}

function MessageItem({ item: message }) {
  return <div style={{ color: "red" }}>{message}</div>;
}

function Game() {
  const gameLogs = useGameLogs();

  // Modal
  const { showModal } = useModal();
  const [idx, setIdx] = useState(0);
  const userInfo = useUserInfo(idx);

  const handleClickUserInfoModal = () => {
    showModal({
      modalType: "UserInfoModal",
      modalProps: {
        userInfo: userInfo,
        message: "Success!",
      },
    });
  };

  return (
    <Wrapper>
      <GameScreen>
        <GameScreenControl>
          <UserBox>
            <UserBoxInfo>1 Player</UserBoxInfo>
            <UserBoxInfo>{gameLogs.playerA}</UserBoxInfo>
            <Link to={"/gamePlay"}>
              <Button type="primary" onClick={() => console.log("ready")}>
                ready
              </Button>
            </Link>
          </UserBox>
          <SizedBox width={50}></SizedBox>
          <UserBox>
            <UserBoxInfo>2 Player</UserBoxInfo>
            <UserBoxInfo>{gameLogs.playerB}</UserBoxInfo>
            <Button type="primary" onClick={() => console.log("ready")}>
              ready
            </Button>
          </UserBox>
        </GameScreenControl>
        <GameWaitingQueue>
          {/* Waiting User List Showing */}
          <WaitingUser>A</WaitingUser>
          <WaitingUser>B</WaitingUser>
          <WaitingUser>C</WaitingUser>
          <WaitingUser>D</WaitingUser>
          <Button type="primary" style={{ backgroundColor: "red", border: 0 }}>
            <Link to={"/"}>나가기</Link>
          </Button>
        </GameWaitingQueue>
      </GameScreen>
      <ChattingScreen>
        <Radio.Group size="large">
          <Radio.Button value="large" onClick={() => console.log("채팅")}>
            채팅
          </Radio.Button>
          <Radio.Button value="default" onClick={handleClickUserInfoModal}>
            유저목록
          </Radio.Button>
          <Radio.Button value="small" onClick={() => console.log("초대")}>
            초대
          </Radio.Button>
        </Radio.Group>
        {/* <DialogueWindow>
          <MessageBox>
            <ChatRoom></ChatRoom>
            <Message></Message>
          </MessageBox>
        </DialogueWindow> */}
        {/* <Input.Group compact> */}
        <ChatRoom nickname={"ts"}></ChatRoom>
        {/* <Input
            style={{ width: "calc(100% - 100px)" }}
            placeholder="입력해주세요."
            value={inputValue}
          />
          <Button
            type="primary"
            style={{ width: "100px" }}
            onClick={() => addMessage()}
          >
            Submit
          </Button> */}
        {/* </Input.Group> */}
      </ChattingScreen>
    </Wrapper>
  );
}
export default Game;
