import React from "react";
import { createRoot } from "react-dom/client";
import "./options.css";

const App: React.FC<{}> = () => {
  return (
    <div>
      <h1>How To Use SuperCanvas?</h1>
      <img src={chrome.runtime.getURL("howto1.png")} />
      <img src={chrome.runtime.getURL("howto2.png")} />
    </div>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
