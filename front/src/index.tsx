import React from "react";
import ReactDOM from "react-dom/client";
import Headder from "./components/headder";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

const headerRoot = ReactDOM.createRoot(
  document.getElementById("header") as HTMLElement
);
headerRoot.render(<Headder />);

const appRoot = ReactDOM.createRoot(
  document.getElementById("main") as HTMLElement
);
appRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
