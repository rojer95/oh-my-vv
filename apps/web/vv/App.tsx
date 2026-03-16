import "@leafer-in/animate";
import "@leafer-in/scroller";
import "@leafer-in/state";
import "@leafer-in/bright";
import { App, Platform, Debug } from "leafer-editor";
import { v4 } from "uuid";
import { useEffect, useRef } from "react";
import { Control } from "./component/control/inex";
import { vvGlobal } from "./mobx/vv-global";
import { testText } from "./test-data";
import { VvImage } from "./ui/vv-image";
import { VvText } from "./ui/vv-text";
// 允许跨域图片渲染，但不支持导出画板内容（浏览器的限制）。
// @ts-ignore
Platform.image.crossOrigin = null;
// Debug.showBounds = true;

export default function VvApp() {
  const app = useRef<App>(undefined);

  const add = () => {
    if (!app.current) return;

    const _app = app.current;

    _app.lockLayout();
    const vvImage = VvImage.one(
      {
        id: v4(),
        editable: true,
        urls: [
          "https://files.tapnow.top/api/conversation/storage/uploads/d0fce519-9c82-4d4b-9c8d-6e384b2fe0f0",
        ],
      },
      0,
      0,
    );
    _app.tree.add(vvImage);

    const vvText = VvText.one(
      {
        id: v4(),
        editable: true,
        text: testText,
      },
      500,
      500,
    );
    _app.tree.add(vvText);

    _app.unlockLayout();
    console.log("add finish");
  };

  useEffect(() => {
    // 挂载到正确的容器
    const _app = new App({
      view: "leafer-view", // 使用容器 ID
      pointer: { through: true },
      editor: {
        rotateable: false,
        resizeable: false,
        strokeWidth: 0,
        bright: true,

        // 框选区域的样式
        area: {
          stroke: "#5f5f5f",
        },

        // hover 样式，目前只能定义笔触、填充、简单阴影样式（会继承基础样式）。
        hoverStyle: {
          strokeWidth: 2,
          stroke: "#dedede",
        },

        // 选中元素的样式
        selectedStyle: {
          strokeWidth: 2,
          stroke: "#dedede",
        },
      },
    });

    vvGlobal.setApp(_app);

    app.current = _app;

    add();

    return () => {
      _app.destroy();
      vvGlobal.setApp(undefined);
    };
  }, []);

  return (
    <>
      <Control />
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
