import { useEffect, useState } from "react";
import { api } from "./lib/api";

function App() {
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    // 1. GET 請求（帶有全自動補全）
    const { data, error } = await api.get();
    console.log("error", error);

    if (!error) setMsg(data.message);

    // 2. POST 請求（如果你輸入錯誤的類型，編譯器會報錯）
    const { data: user } = await api.user.post({
      name: "Bun User",
      age: 25, // 如果這裡寫字串，TypeScript 會立刻提醒你
    });
    console.log("新用戶:", user);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>前端與後端已鏈接</h1>
      <p>來自 API 的消息: {msg}</p>
    </div>
  );
}

export default App;
