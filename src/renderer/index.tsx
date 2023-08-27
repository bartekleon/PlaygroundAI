import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import "./index.css";

import { Main } from "./components/main";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("app")!).render(
  <HashRouter>
    <Main />
  </HashRouter>
);
