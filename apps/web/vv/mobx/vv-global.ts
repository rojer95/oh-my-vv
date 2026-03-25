import { Connector } from "leafer-connector";
import { IUI, Leafer, Path, PointerEvent, Rect, UI } from "leafer-ui";
import { uniq } from "lodash-es";
import { makeAutoObservable } from "mobx";
import { VvApp } from "../ui/vv-app";

class VvGlobal {
  app?: VvApp;
  activeNode?: UI;
  maskLayer?: Leafer;
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

  activeNodeId?: string = undefined;
  generatingNodeId: string[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setApp(_app?: VvApp) {
    if (_app) {
      this.app = _app;
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
    } else {
      this.app = undefined;
    }
  }

  setActiveNode(_node?: UI) {
    this.activeNode = _node;
    if (_node) {
      this.activeNodeId = _node.id;
      this.linkBtnLeft?.set({ visible: true });
      this.linkBtnRight?.set({ visible: true });
    } else {
      this.activeNodeId = undefined;
      this.linkBtnLeft?.set({ visible: false });
      this.linkBtnRight?.set({ visible: false });
    }
    this.updateToolPosition();
    this.lightConnector();
  }

  // 高亮选中元素的连线
  lightConnector() {
    if (!this.app) return;

    const connectors = this.app.tree.find((i) =>
      i.className === "Connector" ? 1 : 0,
    );

    for (const connector of connectors) {
      const state = (connector as Connector).getState();
      const selected = ([] as IUI[]).concat(this.app.editor.target || []);
      if (selected.some((i) => i.id === state.fromId || i.id === state.toId)) {
        (connector as Connector).setState(
          {
            ...state,
            stroke: "rgba(255, 255, 255, 1)",
          },
          (id) => this.app!.findOne(`#${id}`),
        );
      } else {
        (connector as Connector).setState(
          {
            ...state,
            stroke: "rgba(255, 255, 255, 0.3)",
          },
          (id) => this.app!.findOne(`#${id}`),
        );
      }
    }
  }

  // 弹出节点添加菜单
  showAddNodeMenu(
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

  // 取消绘制中的线段
  unsetConnector() {
    if (this.connector?.connector) {
      this.maskLayer?.remove?.(this.connector?.connector);
      this.connector?.connector?.destroy();
    }
    this.connector = undefined;
  }

  // 隐藏输入框
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

  // 重新绘制全部连线
  updateAllConnectorLine() {
    if (!this.app) return;

    const nodes = this.app.tree.find((i) => {
      return (i as any)?.preNodes?.length > 0 ? 1 : 0;
    });

    for (const node of nodes) {
      const preNodes = this.app.tree.find((i) =>
        (node as any)?.preNodes?.includes?.(i.id) ? 1 : 0,
      );

      if (preNodes.length === 0 || !node.id) continue;

      for (const preNode of preNodes) {
        const existConnector = this.app.tree.find((i) => {
          if (i.className !== "Connector") return 0;
          const state = (i as Connector).getState();
          return state.mode === "node" &&
            state.fromId === preNode.id &&
            state.toId === node.id
            ? 1
            : 0;
        });

        if (existConnector) {
          if (preNode) {
            const newConnector = new Connector(this.app, {
              from: preNode as UI,
              to: node,
              routeType: "bezier",
              bezierCurvature: 0.6,
              routeOptions: {
                bezierFallbackDistance: 0,
              },
              stroke: "rgba(255, 255, 255, 0.3)",
            });
            newConnector.className = "Connector";
            this.app.tree.add(newConnector);
          }
        }
      }
    }
  }

  // 开始绘制连线
  startDrawConnector(e: PointerEvent) {
    if (
      !this.app ||
      !this.activeNode ||
      this.connector ||
      e.target.className !== "linkBtn"
    )
      return;

    (this.activeNode as any)?.__updateWorldMatrix?.();
    this.hideAiChatPosition();

    const position = e.target.data?.position;
    const toPoint = this.app.getWorldPointByPage(e.getPagePoint());
    const fromPoint = {
      x:
        this.activeNode.worldBoxBounds.x! +
        (position === "right" ? this.activeNode.worldBoxBounds.width! : 0),
      y:
        this.activeNode.worldBoxBounds.y! +
        this.activeNode.worldBoxBounds.height! / 2,
    };

    this.activeNode.data.position = position;
    const connector = new Connector(this.app, {
      fromPoint,
      toPoint,
      pointsEditable: false,
      renderThrottleMs: 16,
      updateMode: "render",
      routeType: "bezier",
      bezierCurvature: 0.6,
      routeOptions: {
        bezierFallbackDistance: 0,
      },
    });

    connector.skipJSON = true;
    this.maskLayer?.add(connector);
    this.linkBtnLeft?.set({ visible: false });
    this.linkBtnRight?.set({ visible: false });
    this.hideAiChatPosition();
    this.connector = {
      connector,
      fromNode: this.activeNode,
      fromPoint,
      mode: "draw",
    };
  }

  // 实时渲染绘制中的连线
  renderDrawingConnector(e: PointerEvent) {
    const _app = this.app;
    if (
      !this.connector ||
      !_app ||
      !this.activeNode ||
      !this.connector.connector ||
      this.connector?.mode === "add"
    )
      return;

    const wordPoint = _app.tree.getWorldPointByPage(e.getPagePoint());
    const state = this.connector.connector.getState();

    (this.activeNode as any)?.__updateWorldMatrix?.();

    const fromPoint = {
      x:
        this.activeNode.worldBoxBounds.x +
        (this.activeNode.data?.position === "right"
          ? this.activeNode.worldBoxBounds.width
          : 0),
      y:
        this.activeNode?.worldBoxBounds.y +
        this.activeNode.worldBoxBounds.height / 2,
    };

    const toPoint = {
      x: wordPoint.x,
      y: wordPoint.y,
    };

    this.connector.connector.setState(
      {
        ...state,
        fromPoint,
        toPoint,
      },
      () => undefined,
    );

    const { path: throughPath } = _app.tree.pick({ x: e.x, y: e.y });
    const linkableNode = throughPath.list.find(
      (i) => ["VvText", "VvImage"].includes(i.tag) && i !== this.activeNode,
    );

    if (linkableNode) {
      this.linkHover?.set({
        visible: true,
        x: linkableNode.x,
        y: linkableNode.y,
        width: linkableNode.width,
        height: linkableNode.height,
        cornerRadius: (linkableNode as UI).cornerRadius,
      });
    } else {
      this.linkHover?.set({ visible: false });
    }
  }

  // 结束绘制连线
  endDrawConnector(e: PointerEvent) {
    if (!e.throughPath) return;

    const isClickRight = e.buttons === 2; // 是否是右键
    const isClickEmpty = e.throughPath.list.every((i) => i.tag === "App"); // 是否点击空白地方

    if (this.connector?.mode === "draw" && !isClickRight) {
      // 连接到其他元素上
      const linkableNode = e.throughPath.list.find(
        (i) => ["VvText", "VvImage"].includes(i.tag), // TODO: 优化判定
      );

      if (linkableNode && this.connector.fromNode) {
        linkableNode.set({
          preNodes: uniq([
            ...((linkableNode as any).preNodes || []),
            this.connector.fromNode.id,
          ]),
        });
        this.unsetConnector();
        this.updateAllConnectorLine();
        this.app!.editor.select(linkableNode as UI);
      } else {
        // 空白处，进入ADD模式，弹出添加菜单
        const point = e.getPagePoint();
        this.showAddNodeMenu(point, e);
      }

      this.linkHover?.set({ visible: false });

      // 绘制完毕后重新显示工具栏
      if (this.activeNode) {
        this.linkBtnLeft?.set({ visible: true });
        this.linkBtnRight?.set({ visible: true });
        this.updateToolPosition();
      }
      return;
    }

    // 已经是Add模式，又左键点了一下空白地方就是取消
    if (this.connector?.mode === "add" && !isClickRight) {
      this.unsetConnector();
      return;
    }

    // 空白处右键，可新建节点
    if (isClickRight && isClickEmpty) {
      const point = e.getPagePoint();
      this.showAddNodeMenu(point, e);
    }
  }

  pushGeneratingNodeId(id: string) {
    this.generatingNodeId = uniq([...this.generatingNodeId, id]);
  }

  popGeneratingNodeId(id: string) {
    this.generatingNodeId = [...this.generatingNodeId].filter((i) => i !== id);
  }
}

export const vvGlobal = new VvGlobal();
