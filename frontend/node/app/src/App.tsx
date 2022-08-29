import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./0_presentation/pages/Home";
import NotFound from "./0_presentation/pages/core/NotFound";
import Header from "./0_presentation/components/Header";
import Game from "./0_presentation/pages/Game";
import Chat from "./0_presentation/pages/Chat";
import styled from "styled-components";

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
        </Routes>
      </Wrapper>
    </Router>
  );
}

export default App;
