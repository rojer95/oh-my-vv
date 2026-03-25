import { EditorEvent, EditorMoveEvent, EditorScaleEvent } from "leafer-editor";
import {
  App,
  IAppConfig,
  KeyEvent,
  MoveEvent,
  PointerEvent,
  UI,
  ZoomEvent,
} from "leafer-ui";
import { vvGlobal } from "../mobx/vv-global";

export class VvApp extends App {
  constructor(input: IAppConfig) {
    super({
      ...input,
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

    // 监听画布移动/缩放
    this.tree.on([MoveEvent.MOVE, ZoomEvent.ZOOM], (e) => {
      vvGlobal.updateToolPosition(); // 更新工具栏的位置
      vvGlobal.renderDrawingConnector(e); // 重绘连线中点线段
    });

    // 监听鼠标按下事件
    this.on(PointerEvent.DOWN, (e: PointerEvent) => {
      vvGlobal.startDrawConnector(e); // 开始绘制连线
    });

    // 监听鼠标移动事件
    this.on(PointerEvent.MOVE, (e: PointerEvent) => {
      vvGlobal.renderDrawingConnector(e); // 实时重绘连线
    });

    // 监听鼠标抬起事件
    this.on(PointerEvent.UP, (e: PointerEvent) => {
      vvGlobal.endDrawConnector(e); // 结束绘制连线
    });

    // 监听选中变化
    this.editor.on(EditorEvent.SELECT, (e) => {
      if (e.value?.worldBoxBounds) {
        vvGlobal.setActiveNode(e.value);
      } else if (e.value?.length === 1 && e.value[0]?.worldBoxBounds) {
        vvGlobal.setActiveNode(e.value[0]);
      } else {
        vvGlobal.setActiveNode(undefined);
      }
    });

    // 监听元素移动，缩放
    this.editor.on([EditorMoveEvent.MOVE, EditorScaleEvent.SCALE], () => {
      vvGlobal.updateToolPosition();
    });

    // 监听键盘
    this.on(KeyEvent.DOWN, (e) => {
      this.focusUi(e);
    });
  }

  // 按空格聚焦元素，pageUP pageDown 切换上下游
  private focusUi(e: KeyEvent) {
    if (e.key === " " && vvGlobal.activeNode) {
      this.tree.zoom(vvGlobal.activeNode, {
        padding: 250,
        transition: {
          event: {
            completed: () => {
              vvGlobal.maskLayer?.set({
                x: vvGlobal.app!.tree.x,
                y: vvGlobal.app!.tree.y,
                width: vvGlobal.app!.tree.width,
                height: vvGlobal.app!.tree.height,
                scale: vvGlobal.app!.tree.scale,
              });
              vvGlobal.updateToolPosition();
            },
          },
        },
      });
    }

    if (
      e.key === "PageUp" &&
      (vvGlobal.activeNode as any)?.preNodes?.length > 0
    ) {
      const preNodes = this.find((i) => {
        return (vvGlobal.activeNode as any).preNodes.includes(i.id) ? 1 : 0;
      });
      if (preNodes.length > 0) {
        this.editor.select(preNodes);
        this.tree.zoom(preNodes, {
          padding: 250,
          transition: {
            event: {
              completed: () => {
                vvGlobal.maskLayer?.set({
                  x: vvGlobal.app!.tree.x,
                  y: vvGlobal.app!.tree.y,
                  width: vvGlobal.app!.tree.width,
                  height: vvGlobal.app!.tree.height,
                  scale: vvGlobal.app!.tree.scale,
                });
                vvGlobal.updateToolPosition();
              },
            },
          },
        });
      }
    }

    if (e.key === "PageDown" && vvGlobal.activeNode) {
      const nextNodes = this.find((i) =>
        (i as any).preNodes?.includes(vvGlobal.activeNode!.id) ? 1 : 0,
      );
      if (nextNodes.length > 0) {
        this.editor.select(nextNodes);
        this.tree.zoom(nextNodes, {
          padding: 250,
          transition: {
            event: {
              completed: () => {
                vvGlobal.maskLayer?.set({
                  x: vvGlobal.app!.tree.x,
                  y: vvGlobal.app!.tree.y,
                  width: vvGlobal.app!.tree.width,
                  height: vvGlobal.app!.tree.height,
                  scale: vvGlobal.app!.tree.scale,
                });
                vvGlobal.updateToolPosition();
              },
            },
          },
        });
      }
    }
  }

  /**
   * 在画布上添加一个元素
   * @param one
   */
  public addOne(one: UI) {
    this.lockLayout();
    if (one.around === "center") {
      const transform = { ...one.localTransform };
      one.around = "top-left";
      one.setTransform(transform);
    }

    this.tree.add(one);
    this.unlockLayout();
    this.editor.select(one);
    vvGlobal.unsetConnector();
    vvGlobal.updateAllConnectorLine();
    vvGlobal.updateToolPosition();
  }

  override destroy(sync?: boolean): void {
    // 取消事件订阅
    this.off([PointerEvent.MOVE, KeyEvent.DOWN]);
    this.tree.off([MoveEvent.MOVE, ZoomEvent.ZOOM]);
    this.editor.off([
      EditorEvent.SELECT,
      EditorMoveEvent.MOVE,
      EditorScaleEvent.SCALE,
    ]);
    super.destroy(sync);
  }
}
