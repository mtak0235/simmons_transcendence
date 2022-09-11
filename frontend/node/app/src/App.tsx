import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./0_presentation/pages/Home";
import NotFound from "./0_presentation/pages/core/NotFound";
import Header from "./0_presentation/components/Header";
import Game from "./0_presentation/pages/Game";
import Chat from "./0_presentation/pages/Chat";
import styled from "styled-components";
import { useCallback, useEffect, useRef, useState } from "react";
import { socket, SOCKET_EVENT } from "./1_application/socket";
import { SocketContext } from "./1_application/socket";
import NicknameForm from "./0_presentation/pages/NicknameForm";

const Wrapper = styled.div`
  position: relative;
  top: 100px;
`;

function App() {
  const prevNickname = useRef(null); // prevNickname 변경은 컴포넌트를 리렌더링 하지않습니다.
  const [nickname, setNickname] = useState("김첨지");
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    if (prevNickname.current) {
      socket.emit(SOCKET_EVENT.UPDATE_NICKNAME, {
        // 서버에는 이전 닉네임과 바뀐 닉네임을 전송해줍니다.
        prevNickname: prevNickname.current,
        nickname,
      });
    } else {
      socket.emit(SOCKET_EVENT.JOIN_ROOM, { nickname });
    }
  }, [nickname]);

  const handleSubmitNickname = useCallback(
    (newNickname) => {
      prevNickname.current = nickname;
      setNickname(newNickname);
    },
    [nickname]
  );

  return (
    <SocketContext.Provider value={socket}>
      <Router>
        <Header />
        <Wrapper>
          <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <NicknameForm handleSubmitNickname={handleSubmitNickname} />
          </div>
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Home />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Wrapper>
      </Router>
    </SocketContext.Provider>
  );
}

export default App;
