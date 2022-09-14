import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@presentation/home/Home";
import NotFound from "@presentation/pages/core/NotFound";
import Header from "@presentation/components/Header";
import Game from "@presentation/pages/Game";
import Chat from "@presentation/pages/Chat";
import styled from "styled-components";
import Test1 from "@presentation/pages/Test1";
import Test2 from "@presentation/pages/Test2";

const Wrapper = styled.div`
  position: relative;
  top: 100px;
`;

function App() {
  return (
    <Router>
      <Header />
      <Wrapper>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/game/:id" element={<Game />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/test1" element={<Test1 />} />
          <Route path="/test2" element={<Test2 />} />
        </Routes>
      </Wrapper>
    </Router>
  );
}

export default App;
