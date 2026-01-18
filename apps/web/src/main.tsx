import ReactDOM from "react-dom/client";

import App from "./App.tsx";

import "@/dayjs";

import "@/global.css";

import "reset-css/reset.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />,
);
