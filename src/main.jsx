import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import LimiteDeErro from "./components/ui/LimiteDeErro.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LimiteDeErro>
      <App />
    </LimiteDeErro>
  </React.StrictMode>
);
