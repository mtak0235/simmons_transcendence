import { BrowserRouter, Route, Routes } from "react-router-dom";
import styled from "styled-components";

import Home from "@presentation/home/Home";
import NotFound from "@presentation/pages/core/NotFound";
import Header from "@presentation/components/Header";
import Game from "@root/0_presentation/game/Game";
import Chat from "@presentation/pages/Chat";
import Test1 from "@presentation/pages/Test1";
import LoginHandler from "@presentation/components/LoginHandler";
import SocketHandler from "@presentation/components/SocketHandler";
import GamePlay from "@presentation/game/GamePlay";
import Test2 from "@presentation/pages/Test2";

const Wrapper = styled.div`
  position: relative;
  top: 100px;
`;

function App() {
  return (
    <BrowserRouter>
      <LoginHandler>
        <SocketHandler>
          <Header />
          <Wrapper>
            <Routes>
              <Route path="*" element={<NotFound />} />
              <Route path="/" element={<Home />} />
              <Route path="/ggg" element={<GamePlay />} />
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
