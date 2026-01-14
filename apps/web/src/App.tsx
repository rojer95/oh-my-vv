import { useRequest } from "ahooks";
import { useState } from "react";
import { api } from "./lib/api";

function App() {
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    console.log("run fetchData");

    // 1. GET 請求（帶有全自動補全）
    const { data, error: error1 } = await api.api.get();
    console.log("data", data);

    if (!error1) setMsg(data.message);

    // 2. POST 請求（如果你輸入錯誤的類型，編譯器會報錯）
    const { data: user, error: error2 } = await api.api.admins.get();
    if (!error2) {
      console.log("新用戶:", user);
    } else {
      alert(error2.value.message);
    }
  };

  useRequest(fetchData);

  return (
    <div>
      <h1>前端與後端已鏈接</h1>
      <p>來自 API 的消息: {msg}</p>
    </div>
  );
}

export default App;
