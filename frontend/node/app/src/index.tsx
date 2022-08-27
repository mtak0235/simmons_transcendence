import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "antd/dist/antd.min.css";
import "./index.css";
import App from "./App";
import dependencyInject from "./3_infrastructure/core/DependencyInject";
import { RecoilRoot } from "recoil";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

dependencyInject();

root.render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
);
