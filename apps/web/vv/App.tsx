import "@leafer-in/animate";
import "@leafer-in/bright";
import "@leafer-in/scroller";
import "@leafer-in/state";
import { Platform } from "leafer-editor";
import { useEffect } from "react";
import { ChatInput } from "./component/chat-input";
import { vvGlobal } from "./mobx/vv-global";
import { VvApp } from "./ui/vv-app";
import { AddNodeMenu } from "./component/add-node-menu";

// 允许跨域图片渲染，但不支持导出画板内容（浏览器的限制）。
// @ts-ignore
Platform.image.crossOrigin = null;
// Debug.showBounds = true;

export default function App() {
  useEffect(() => {
    // 挂载到正确的容器
    const _app = new VvApp({
      view: "leafer-view", // 使用容器 ID
    });

    vvGlobal.setApp(_app);

    return () => {
      _app.destroy();
      vvGlobal.setApp(undefined);
    };
  }, []);

  return (
    <>
      <ChatInput />
      <AddNodeMenu />
      {/* Leafer 画布容器 */}
      <div
        id="leafer-view"
        style={{
          zIndex: 0,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "var(--semi-color-bg-0)",
        }}
      />
    </>
  );
}
