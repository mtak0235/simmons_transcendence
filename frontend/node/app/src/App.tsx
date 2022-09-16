import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@presentation/home/Home";
import NotFound from "@presentation/pages/core/NotFound";
import Header from "@presentation/components/Header";
import Game from "@presentation/pages/Game";
import Chat from "@presentation/pages/Chat";
import styled from "styled-components";
import Test1 from "@presentation/pages/Test1";
import Test2 from "@presentation/pages/Test2";
import LoginHandler from "@presentation/components/LoginHandler";
import Login from "@presentation/pages/Login";
import ErrorHandler from "@presentation/components/ErrorHandler";
import SocketHandler from "@presentation/components/SocketHandler";

const Wrapper = styled.div`
  position: relative;
  top: 100px;
`;

function App() {
  return (
    <Router>
      <LoginHandler>
        {/*<ErrorHandler>*/}
        {/*<CustomErrorBoundary>*/}
        <SocketHandler>
          <Header />
          <Wrapper>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/game/:id" element={<Game />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/test1" element={<Test1 />} />
              <Route path="/test2" element={<Test2 />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Wrapper>
        </SocketHandler>
        {/*</CustomErrorBoundary>*/}
        {/*</ErrorHandler>*/}
      </LoginHandler>
    </Router>
  );
}

export default App;
