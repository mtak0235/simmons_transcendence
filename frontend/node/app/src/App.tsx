import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "@presentation/home/Home";
import NotFound from "@presentation/pages/core/NotFound";
import Header from "@presentation/components/Header";
import Game from "@root/0_presentation/game/Game";
import Chat from "@presentation/pages/Chat";
import styled from "styled-components";
import Test1 from "@presentation/pages/Test1";
import LoginHandler from "@presentation/components/LoginHandler";
import Login from "@presentation/auth/Login";
import SocketHandler from "@presentation/components/SocketHandler";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import NicknameForm from "./0_presentation/pages/NicknameForm";
import ChatRoom from "./0_presentation/pages/ChatRoom";
import ISocket from "@domain/socket/ISocket";
import Get from "@root/lib/di/get";
import GamePlay from "./0_presentation/game/GamePlay";
import Test2 from "@presentation/pages/Test2";

const Wrapper = styled.div`
  position: relative;
  top: 100px;
`;

function handleSingleUserConnected(data) {}

function App() {
  const socket: ISocket<any, any> = Get.get("ISocket");

  //todo: remove
  const prevNickname = useRef(null); // prevNickname 변경은 컴포넌트를 리렌더링 하지않습니다.

  // useEffect(() => {
  //   socket.on(SOCKET_EVENT.SINGLE_USER_CONNECTED, handleSingleUserConnected);
  //   return () => {
  //     // socket.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (prevNickname.current) {
  //     socket.emit(SOCKET_EVENT.UPDATE_NICKNAME, {
  //       // 서버에는 이전 닉네임과 바뀐 닉네임을 전송해줍니다.
  //       prevNickname: prevNickname.current,
  //       nickname,
  //     });
  //   } else {
  //     socket.emit(SOCKET_EVENT.JOIN_ROOM, { nickname });
  //   }
  // }, [nickname]);

  // const handleSubmitNickname = useCallback(
  //   (newNickname) => {
  //     prevNickname.current = nickname;
  //     setNickname(newNickname);
  //   },
  //   [nickname]
  // );

  return (
    <BrowserRouter>
      <LoginHandler>
        <SocketHandler>
          <Header />
          <Wrapper>
            {/*<div className="d-flex flex-column justify-content-center align-items-center vh-100">*/}
            {/*  <NicknameForm handleSubmitNickname={handleSubmitNickname} />*/}
            {/*</div>*/}
            <Routes>
              <Route path="*" element={<NotFound />} />
              <Route path="/" element={<Home />} />
              {/* <Route path="/" element={<GamePlay />} /> */}
              <Route path="/game/:id" element={<Game />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/test1" element={<Test1 />} />
              <Route path="/test2" element={<Test2 />} />
            </Routes>
          </Wrapper>
        </SocketHandler>
      </LoginHandler>
    </BrowserRouter>
  );
}

export default App;
