import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./0_presentation/pages/Home";
import NotFound from "./0_presentation/pages/core/NotFound";
import Header from "./0_presentation/components/Header";
import Game from "./0_presentation/pages/Game";
import Chat from "./0_presentation/pages/Chat";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
