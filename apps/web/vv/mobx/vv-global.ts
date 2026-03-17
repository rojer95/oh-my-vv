import { Connector } from "leafer-connector";
import { App, Path, Rect, UI } from "leafer-ui";
import { makeAutoObservable } from "mobx";

class VvGlobal {
  app?: App;
  activeNode?: UI;
  maskLayer?: UI;
  linkHover?: UI;
  linkBtnLeft?: UI;
  linkBtnRight?: UI;
  connector?: {
    mode: "draw" | "add";
    connector?: Connector;
    fromNode?: UI;
    fromPoint?: { x: number; y: number };
    addAt?: { x: number; y: number };
    menuAt?: { x: number; y: number };
  };
  aiChatBoxPosition: {
    visible: boolean;
    x?: number;
    y?: number;
  } = { visible: false };
  rid: number = 1;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setApp(_app?: App) {
    this.app = _app;
    if (this.app) {
      this.maskLayer = this.app.addLeafer({
        type: "viewport",
        fill: "rgba(255, 0, 0, 0.2)",
      });

      this.linkHover = Rect.one({
        width: 0,
        height: 0,
        fill: "rgba(255, 255, 255, 0.3)",
        x: 0,
        y: 0,
        cornerRadius: 0,
        visible: false,
        className: "linkHover",
      });

      this.maskLayer?.add([this.linkHover]);

      this.linkBtnRight = Path.one({
        path: "M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0Zm-11 9a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-5-9a1 1 0 0 1 1-1h3V8a1 1 0 1 1 2 0v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 0 1-1-1Z",
        width: 32,
        height: 32,
        fill: "rgba(255, 255, 255, 0.6)",
        x: 0,
        y: 0,
        visible: false,
        around: "center",
        hoverStyle: {
          fill: "rgba(255, 255, 255, 1)",
          cursor: "crosshair",
        },
        className: "linkBtn",
        data: {
          position: "right",
        },
      });

      this.linkBtnLeft = Path.one({
        path: "M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0Zm-11 9a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-5-9a1 1 0 0 1 1-1h3V8a1 1 0 1 1 2 0v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 0 1-1-1Z",
        width: 32,
        height: 32,
        fill: "rgba(255, 255, 255, 0.6)",
        x: 0,
        y: 0,
        visible: false,
        around: "center",
        hoverStyle: {
          fill: "rgba(255, 255, 255, 1)",
          cursor: "crosshair",
        },
        className: "linkBtn",
        data: {
          position: "left",
        },
      });

      this.app.editor.editBox.add([this.linkBtnRight, this.linkBtnLeft]);
    }
  }

  setActiveNode(_node?: UI) {
    this.activeNode = _node;
  }

  setConnector(
    connector: Connector,
    fromNode: UI,
    fromPoint: { x: number; y: number },
  ) {
    this.connector = { connector, fromNode, fromPoint, mode: "draw" };
  }

  setConnectorAddMode(
    addAt: { x: number; y: number },
    menuAt: { x: number; y: number },
  ) {
    if (!this.connector) {
      this.connector = { mode: "add" };
    }
    this.connector.mode = "add";
    this.connector.addAt = addAt;
    this.connector.menuAt = menuAt;
  }

  unsetConnector() {
    if (this.connector?.connector) {
      this.maskLayer?.remove?.(this.connector?.connector);
      this.connector?.connector?.destroy();
    }
    this.connector = undefined;
  }

  hideAiChatPosition() {
    this.aiChatBoxPosition = { visible: false };
  }

  // 工具栏计算并更新位置
  updateToolPosition() {
    if (this.connector) return;

    if (!this.activeNode) {
      this.aiChatBoxPosition = { visible: false };
      this.linkBtnLeft?.set({ visible: false });
      this.linkBtnRight?.set({ visible: false });
    } else {
      (this.activeNode as any)?.__updateWorldMatrix?.();
      const bounds = this.activeNode.worldBoxBounds;

      this.aiChatBoxPosition = {
        visible: true,
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height,
      };

      this.linkBtnLeft?.set({
        x: -18,
        y: bounds.height / 2,
        visible: true,
      });

      this.linkBtnRight?.set({
        x: bounds.width + 18,
        y: bounds.height / 2,
        visible: true,
      });
    }
  }

  rerender() {
    this.rid++;
  }
}

export const vvGlobal = new VvGlobal();
