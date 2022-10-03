import { Button, Input, Radio } from "antd";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import useGameLogs from "@application/game/useGame";
import { useUserInfo } from "@application/user/useUser";
import User from "../../2_domain/user/user";
import useModal from "../components/modal/hooks";
import { SizedBox } from "../components/TSDesign";
import { useRecoilState, useRecoilValue } from "recoil";
import { useRef, useState, useEffect } from "react";
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import RecoilSelector from "@infrastructure/recoil/RecoilSelector";
import ISocketEmit from "@domain/socket/ISocketEmit";
import Get from "@root/lib/di/get";
import RecoilAtom from "@infrastructure/recoil/RecoilAtom";
import GamePlay from "@presentation/game/GamePlay";
import SocketDto from "SocketDto";
import socketEmit from "@infrastructure/socket/SocketEmit";
import { getRecoil } from "recoil-nexus";

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
  width: 80%;
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

const PaginationStyle = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
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

const ContentStyle = styled.div`
  height: calc(100vh - 100px);
  width: 100%;
  overflow: auto;
`;

function ChatRoom({ nickName }) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  let idx = useRef(0);
  const addItem = () => {
    setMessages((prev) => [...prev, `[${nickName}]` + inputValue]);
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

function Content({ sidebar, users, friends }) {
  const { showModal } = useModal();
  const userInfo = useUserInfo(0);

  const handleUserInfoModal = () => {
    showModal({
      modalType: "UserInfoModal",
      modalProps: {
        userInfo: userInfo,
        message: "Success!",
      },
    });
  };
  return (
    <ContentStyle style={{ overflow: "scroll" }}>
      {sidebar == "total" &&
        users.map(({ userId, username, status }) => (
          <List key={userId}>
            <ListItem disablePadding>
              <ListItemButton
                style={{
                  width: 180,
                  display: "flex",
                  textAlign: "center",
                  background: "lightgrey",
                }}
                onClick={handleUserInfoModal}
              >
                <ListItemText>
                  {status === "online"
                    ? "🟢"
                    : status === "inGame"
                    ? "🔵"
                    : "🟡"}{" "}
                  {username}
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        ))}
      {sidebar == "friend" &&
        friends.map(({ userId, username, status }) => (
          <List key={userId}>
            <ListItem disablePadding>
              <ListItemButton
                style={{
                  width: 180,
                  display: "flex",
                  textAlign: "center",
                  background: "lightgrey",
                }}
                key={userId}
                onClick={handleUserInfoModal}
              >
                <ListItemText>
                  {username} | {status}
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        ))}
    </ContentStyle>
  );
}

function Pagination({ total, limit, page, setPage }) {
  const [pageCount] = useState(Math.ceil(total / limit));

  return (
    <PaginationStyle>
      <Button
        onClick={() => {
          setPage(page - 1);
        }}
        disabled={page === 1}
      >
        &lt;
      </Button>
      <SizedBox width={20} />
      <Button onClick={() => setPage(page + 1)} disabled={page === pageCount}>
        &gt;
      </Button>
    </PaginationStyle>
  );
}

function WaitingUserList() {
  const [waiters, setWaiters] = useState([]);
  const [limit] = useState(4);
  const [page, setPage] = useState(1);
  const offset = (page - 1) * limit;
  const userId = "mtakId";
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => res.json())
      .then((data) =>
        setWaiters(
          data.map((record) => {
            record["userId"] = record.id;
            record["username"] = `${record.id}님`;
            return record;
          })
        )
      );
  }, []);
  return (
    <GameWaitingQueue>
      {waiters.slice(offset, offset + limit).map(({ username, userId }) => (
        <WaitingUser>{username}</WaitingUser>
      ))}
      <Pagination
        total={waiters.length}
        limit={limit}
        page={page}
        setPage={setPage}
      />
      <Button type="primary" style={{ backgroundColor: "red", border: 0 }}>
        {waiters.map(({ userId }) => userId).includes(userId) && (
          <Link to={"/"}>나가기</Link>
        )}
      </Button>
    </GameWaitingQueue>
  );
}

function GameWaitingScreen() {
  const socketEmit: ISocketEmit = Get.get("ISocketEmit");
  const me = useRecoilValue(RecoilSelector.user.me);
  const channelPrivate = useRecoilValue(RecoilSelector.channel.private);
  const [matcher, setMatcher] = useState<SocketDto.Matcher[]>([]);
  const [playerA, setPlayerA] = useState<SocketDto.Matcher>({
    userId: 0,
    isReady: false,
  });
  const [playerB, setPlayerB] = useState<SocketDto.Matcher>({
    userId: 0,
    isReady: false,
  });

  // const preventClose = (e: BeforeUnloadEvent) => {
  //   e.preventDefault();
  //   // e.returnValue = ""; // chrome에서는 설정이 필요해서 넣은 코드
  // };
  //
  // // 브라우저에 렌더링 시 한 번만 실행하는 코드
  // useEffect(() => {
  //   (() => {
  //     window.addEventListener("beforeunload", preventClose);
  //   })();
  //
  //   return () => {
  //     // window.location.href = "/";
  //     window.removeEventListener("beforeunload", preventClose);
  //   };
  // }, []);

  useEffect(() => {
    if (channelPrivate.matcher && channelPrivate.matcher.length > 0)
      setMatcher(channelPrivate.matcher);
  }, [channelPrivate]);
  //
  // const userBox = matcher.map((user, idx) => {
  //   console.log(user);
  //   return (
  //     <UserBox key={idx}>
  //       <UserBoxInfo>{idx === 0 ? "Player A" : "Player B"}</UserBoxInfo>
  //       <UserBoxInfo>{user.userId}</UserBoxInfo>
  //
  //       <Button
  //         type="primary"
  //         disabled={user.userId != me.userId}
  //         onClick={() => {
  //           socketEmit.readyGame();
  //         }}
  //       >
  //         {user.isReady ? "준비완료" : "대기중"}
  //       </Button>
  //     </UserBox>
  //   );
  // });

  return (
    <>
      {matcher.map((user, idx) => {
        console.log(user);
        return (
          <UserBox key={idx}>
            <UserBoxInfo>{idx === 0 ? "Player A" : "Player B"}</UserBoxInfo>
            <UserBoxInfo>{user.userId}</UserBoxInfo>

            <Button
              type="primary"
              disabled={user.userId != me.userId}
              onClick={() => {
                socketEmit.readyGame();
              }}
            >
              {user.isReady ? "준비완료" : "대기중"}
            </Button>
          </UserBox>
        );
      })}
      {/*{userBox}*/}
      {/*<UserBox>*/}
      {/*  <UserBoxInfo>Player A</UserBoxInfo>*/}
      {/*  <UserBoxInfo>{playerA ? playerA.userId : ""}</UserBoxInfo>*/}
      {/*  <Link to={"/gamePlay"}>*/}
      {/*    <Button*/}
      {/*      type="primary"*/}
      {/*      disabled={playerA.userId !== me.userId}*/}
      {/*      onClick={() => {*/}
      {/*        console.log("ready");*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      {playerA.isReady ? "준비완료" : "대기중"}*/}
      {/*    </Button>*/}
      {/*  </Link>*/}
      {/*</UserBox>*/}
      {/*<SizedBox width={50}></SizedBox>*/}
      {/*<UserBox>*/}
      {/*  <UserBoxInfo>Player B</UserBoxInfo>*/}
      {/*  <UserBoxInfo>{playerB ? playerB.userId : ""}</UserBoxInfo>*/}
      {/*  <Button*/}
      {/*    type="primary"*/}
      {/*    disabled={playerB.userId !== me.userId}*/}
      {/*    onClick={() => console.log("ready")}*/}
      {/*  >*/}
      {/*    {playerB.isReady ? "준비완료" : "대기중"}*/}
      {/*  </Button>*/}
      {/*</UserBox>*/}
    </>
  );
}
function Game() {
  const socketEmit: ISocketEmit = Get.get("ISocketEmit");
  const me = useRecoilValue(RecoilSelector.user.me);
  const users = useRecoilValue(RecoilSelector.user.users);
  // const channelPrivate = useRecoilValue(RecoilSelector.channel.private);
  const [channelPrivate, setChannelPrivate] = useRecoilState(
    RecoilAtom.channel.channelPrivate
  );
  const onGame = useRecoilValue(RecoilAtom.game.onGame);
  const [sidebar, setSidebar] = useState("chatting");
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      socketEmit.outChannel();
    };
  }, []);

  // Modal
  const { showModal } = useModal();
  const [idx, setIdx] = useState(0);
  const userInfo = useUserInfo(idx);

  useEffect(() => {
    console.log("hello");
  }, [getRecoil(RecoilSelector.channel.private)]);

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
          {!onGame ? (
            <GameWaitingScreen></GameWaitingScreen>
          ) : (
            <GamePlay></GamePlay>
          )}
        </GameScreenControl>
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={(e) => {
              socketEmit.waitingGame();
            }}
          >
            게임 대기
          </button>
        </div>
      </GameScreen>
      <ChattingScreen>
        <Radio.Group size="large">
          <Radio.Button
            checked={sidebar == "chatting"}
            value="large"
            onClick={() => {
              setSidebar("chatting");
              console.log(sidebar);
            }}
          >
            채팅
          </Radio.Button>
          <Radio.Button
            value="default"
            onClick={() => {
              setSidebar("total");
              console.log(sidebar);
            }}
          >
            전체 목록
          </Radio.Button>
          <Radio.Button
            value="small"
            onClick={() => {
              setSidebar("friend");
              console.log(sidebar);
            }}
          >
            친구 목록
          </Radio.Button>
        </Radio.Group>
        {/* <DialogueWindow>
          <MessageBox>
            <ChatRoom></ChatRoom>
            <Message></Message>
          </MessageBox>
        </DialogueWindow> */}
        {/* <Input.Group compact> */}
        {sidebar == "chatting" && <ChatRoom nickName={"ts"}></ChatRoom>}
        {(sidebar == "total" || sidebar == "friend") && (
          <Content sidebar={sidebar} users={users} friends={friends}></Content>
        )}
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
