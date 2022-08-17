import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./0_presentation/components/layouts/Layout";

const NotFound = React.lazy(
  () => import("./0_presentation/pages/core/NotFound")
);
const Home = React.lazy(() => import("./0_presentation/pages/Home"));
const About = React.lazy(() => import("./0_presentation/pages/About"));
const Setting = React.lazy(() => import("./0_presentation/pages/Setting"));
const Game = React.lazy(() => import("./0_presentation/pages/Game"));

const App: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={<div>Loading Page...</div>}>
        <Routes>
          <Route path="*" element={<NotFound></NotFound>}></Route>
          <Route path="/" element={<Home></Home>}></Route>
          <Route path="/game" element={<Game></Game>}></Route>
          <Route path="/about" element={<About></About>}></Route>
          <Route path="/setting" element={<Setting></Setting>}></Route>
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default App;
