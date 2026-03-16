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
}

export const vvGlobal = new VvGlobal();
