import { useCallback, useEffect, useState } from "react";

import { IconSearch, IconTemplateStroked } from "@douyinfe/semi-icons";
import { AIChatInput, Avatar, Card, Dropdown, Space } from "@douyinfe/semi-ui";
import { Connector } from "leafer-connector";
import { EditorEvent, EditorMoveEvent } from "leafer-editor";
import {
  IUI,
  KeyEvent,
  MoveEvent,
  PointerEvent,
  UI,
  ZoomEvent,
} from "leafer-ui";
import { uniq } from "lodash-es";
import { observer } from "mobx-react-lite";
import { v4 } from "uuid";
import { vvGlobal } from "../../mobx/vv-global";
import { VvImage } from "../../ui/vv-image";
import { VvText } from "../../ui/vv-text";
import { SizeBox } from "../size";

// 定义选中数据接口
interface SelectData {
  visible: boolean;
  x?: number;
  y?: number;
}

const modelOptions = [
  { value: "GPT-5", label: "GPT-5" },
  { value: "GPT-4o", label: "GPT-4o" },
  { value: "Claude 3.5 Sonnet", label: "Claude 3.5 Sonnet" },
];

export const Control = observer(() => {
  const [selectData, setSelectData] = useState<SelectData>();

  // 计算并更新位置（节流版本）
  const updatePosition = () => {
    if (vvGlobal.connector) return;

    if (!vvGlobal.activeNode) {
      setSelectData({ visible: false });
      vvGlobal.linkBtnLeft?.set({ visible: false });
      vvGlobal.linkBtnRight?.set({ visible: false });
    } else {
      (vvGlobal.activeNode as any)?.__updateWorldMatrix?.();
      const bounds = vvGlobal.activeNode.worldRenderBounds;
      setSelectData({
        visible: true,
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height,
      });

      vvGlobal.linkBtnLeft?.set({
        x: -18,
        y: bounds.height / 2,
        visible: true,
      });

      vvGlobal.linkBtnRight?.set({
        x: bounds.width + 18,
        y: bounds.height / 2,
        visible: true,
      });
    }
  };

  const updateDrawingConnector = (e: PointerEvent) => {
    const _app = vvGlobal.app;
    if (
      !vvGlobal.connector ||
      !_app ||
      !vvGlobal.activeNode ||
      !vvGlobal.connector.connector ||
      vvGlobal.connector?.mode === "add"
    )
      return;

    const wordPoint = _app.tree.getWorldPointByPage(e.getPagePoint());
    const state = vvGlobal.connector.connector.getState();

    (vvGlobal.activeNode as any)?.__updateWorldMatrix?.();

    const fromPoint = {
      x:
        vvGlobal.activeNode.worldBoxBounds.x +
        (vvGlobal.activeNode.data?.position === "right"
          ? vvGlobal.activeNode.worldBoxBounds.width
          : 0),
      y:
        vvGlobal.activeNode?.worldBoxBounds.y +
        vvGlobal.activeNode.worldBoxBounds.height / 2,
    };

    const toPoint = {
      x: wordPoint.x,
      y: wordPoint.y,
    };

    vvGlobal.connector.connector.setState(
      {
        ...state,
        fromPoint,
        toPoint,
      },
      () => undefined,
    );

    const { path: throughPath } = _app.tree.pick({ x: e.x, y: e.y });
    const linkableNode = throughPath.list.find(
      (i) => ["VvText", "VvImage"].includes(i.tag) && i !== vvGlobal.activeNode,
    );

    if (linkableNode) {
      vvGlobal.linkHover?.set({
        visible: true,
        x: linkableNode.x,
        y: linkableNode.y,
        width: linkableNode.width,
        height: linkableNode.height,
        cornerRadius: (linkableNode as UI).cornerRadius,
      });
    } else {
      vvGlobal.linkHover?.set({ visible: false });
    }
  };

  const updateConnector = () => {
    if (!vvGlobal.app) return;

    const nodes = vvGlobal.app.tree.find((i) => {
      return (i as any)?.preNodes?.length > 0 ? 1 : 0;
    });

    for (const node of nodes) {
      const preNodes = vvGlobal.app.tree.find((i) =>
        (node as any)?.preNodes?.includes?.(i.id) ? 1 : 0,
      );

      if (preNodes.length === 0 || !node.id) continue;

      for (const preNode of preNodes) {
        const existConnector = vvGlobal.app.tree.find((i) => {
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
            const newConnector = new Connector(vvGlobal.app, {
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
            vvGlobal.app.tree.add(newConnector);
          }
        }
      }
    }
  };

  const lightConnector = () => {
    if (!vvGlobal.app) return;

    const connectors = vvGlobal.app.tree.find((i) =>
      i.className === "Connector" ? 1 : 0,
    );

    for (const connector of connectors) {
      const state = (connector as Connector).getState();
      const selected = ([] as IUI[]).concat(vvGlobal.app.editor.target || []);
      if (selected.some((i) => i.id === state.fromId || i.id === state.toId)) {
        (connector as Connector).setState(
          {
            ...state,
            stroke: "rgba(255, 255, 255, 1)",
          },
          (id) => vvGlobal.app!.findOne(`#${id}`),
        );
      } else {
        (connector as Connector).setState(
          {
            ...state,
            stroke: "rgba(255, 255, 255, 0.3)",
          },
          (id) => vvGlobal.app!.findOne(`#${id}`),
        );
      }
    }
  };

  useEffect(() => {
    if (!vvGlobal.app) return;

    const _app = vvGlobal.app;

    // 监听画布移动/缩放
    _app.tree.on([MoveEvent.MOVE, ZoomEvent.ZOOM], (e) => {
      updatePosition();
      updateDrawingConnector(e);
    });

    // 监听画布上的元素移动
    _app.editor.on([EditorMoveEvent.MOVE], updatePosition);

    // 监听选中变化
    _app.editor.on(EditorEvent.SELECT, (e) => {
      if (e.value?.worldRenderBounds) {
        vvGlobal.setActiveNode(e.value);
      } else if (e.value?.length === 1 && e.value[0]?.worldRenderBounds) {
        vvGlobal.setActiveNode(e.value[0]);
      } else {
        vvGlobal.setActiveNode(undefined);
      }
      updatePosition(); // 选中后立即更新位置
      lightConnector(); // 更新连线
    });

    // 连接性-按下事件
    _app.on(PointerEvent.DOWN, (e: PointerEvent) => {
      if (
        e.target.className === "linkBtn" &&
        !vvGlobal.connector &&
        vvGlobal.activeNode &&
        vvGlobal.app
      ) {
        startConnector(
          vvGlobal.app.getWorldPointByPage(e.getPagePoint()),
          e.target.data?.position,
        );
      }
    });

    // 连接性-移动鼠标
    _app.on(PointerEvent.MOVE, updateDrawingConnector);

    // 连接性-弹起事件
    _app.on(PointerEvent.UP, (e: PointerEvent) => {
      const isRight = e.buttons === 2;
      if (!_app || !e.throughPath) return;

      if (vvGlobal.connector && !isRight) {
        const linkableNode = e.throughPath.list.find((i) =>
          ["VvText", "VvImage"].includes(i.tag),
        );

        if (linkableNode && vvGlobal.connector.fromNode) {
          linkableNode.set({
            preNodes: uniq([
              ...((linkableNode as any).preNodes || []),
              vvGlobal.connector.fromNode.id,
            ]),
          });
          vvGlobal.unsetConnector();
          updateConnector();
          _app.editor.select(linkableNode as UI);
        } else {
          if (vvGlobal.connector.mode === "add") {
            // 已经是Add模式，又点了一下就是取消
            vvGlobal.unsetConnector();
          } else {
            const point = e.getPagePoint();
            vvGlobal.setConnectorAddMode(point, e);
          }
        }

        vvGlobal.linkHover?.set({ visible: false });

        if (vvGlobal.activeNode) {
          vvGlobal.linkBtnLeft?.set({ visible: true });
          vvGlobal.linkBtnRight?.set({ visible: true });
          setSelectData({ visible: true });
          updatePosition();
        }

        return;
      }

      // 空白处右键，可新建节点
      if (isRight && e.throughPath.list.every((i) => i.tag === "App")) {
        const point = e.getPagePoint();
        vvGlobal.setConnectorAddMode(point, e);
      }
    });

    // 聚焦
    _app.on(KeyEvent.DOWN, (e) => {
      if (e.key === " " && vvGlobal.activeNode) {
        _app.zoom(vvGlobal.activeNode, {
          padding: 250,
          transition: {
            event: {
              completed: () => {
                updatePosition();
              },
            },
          },
        });
      }

      if (
        e.key === "PageUp" &&
        (vvGlobal.activeNode as any)?.preNodes?.length > 0
      ) {
        const preNodes = _app.find((i) => {
          return (vvGlobal.activeNode as any).preNodes.includes(i.id) ? 1 : 0;
        });
        if (preNodes.length > 0) {
          _app.editor.select(preNodes);
          _app.zoom(preNodes, {
            padding: 250,
            transition: {
              event: {
                completed: () => {
                  updatePosition();
                },
              },
            },
          });
        }
      }

      if (e.key === "PageDown" && vvGlobal.activeNode) {
        const nextNodes = _app.find((i) =>
          (i as any).preNodes?.includes(vvGlobal.activeNode!.id) ? 1 : 0,
        );
        if (nextNodes.length > 0) {
          _app.editor.select(nextNodes);
          _app.zoom(nextNodes, {
            padding: 250,
            transition: {
              event: {
                completed: () => {
                  updatePosition();
                },
              },
            },
          });
        }
      }
    });

    return () => {
      _app.editor.editBox.remove(".linkBtn");
      _app.tree.off([MoveEvent.MOVE, ZoomEvent.ZOOM]);
      _app.editor.off([EditorEvent.SELECT, EditorMoveEvent.MOVE]);
      _app.off([
        PointerEvent.MOVE,
        PointerEvent.DOWN,
        PointerEvent.UP,
        KeyEvent.DOWN,
      ]);
    };
  }, [vvGlobal.app]);

  const renderLeftMenu = useCallback(
    () => (
      <>
        <AIChatInput.Configure.Select
          optionList={modelOptions}
          field="model"
          initValue="GPT-4o"
        />
        <SizeBox />
      </>
    ),
    [],
  );

  const renderTopSlot = useCallback(
    () => (
      <>
        <Space wrap style={{ marginBottom: 12 }}>
          <Avatar shape="square" size="default">
            角色三视图
          </Avatar>
          <Avatar
            shape="square"
            src={
              "https://files.tapnow.top/api/conversation/storage/uploads/d0fce519-9c82-4d4b-9c8d-6e384b2fe0f0"
            }
            imgAttr={{ style: { objectFit: "cover" } }}
            size="default"
          ></Avatar>
        </Space>
      </>
    ),
    [],
  );

  const startConnector = (
    toPoint: { x: number; y: number },
    position: "left" | "right",
  ) => {
    if (!vvGlobal.app || !vvGlobal.activeNode || vvGlobal.connector) return;

    (vvGlobal.activeNode as any)?.__updateWorldMatrix?.();
    setSelectData({ visible: false });

    const fromPoint = {
      x:
        vvGlobal.activeNode.worldBoxBounds.x! +
        (position === "right" ? vvGlobal.activeNode.worldBoxBounds.width! : 0),
      y:
        vvGlobal.activeNode.worldBoxBounds.y! +
        vvGlobal.activeNode.worldBoxBounds.height! / 2,
    };

    vvGlobal.activeNode.data.position = position;
    const connector = new Connector(vvGlobal.app, {
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
    vvGlobal.maskLayer?.add(connector);
    vvGlobal.linkBtnLeft?.set({ visible: false });
    vvGlobal.linkBtnRight?.set({ visible: false });
    setSelectData({ visible: false });
    vvGlobal.setConnector(connector, vvGlobal.activeNode, fromPoint);
  };

  return (
    <>
      <div
        style={{
          zIndex: 1,
          position: "absolute",
          transform: `translate(calc(${!selectData?.visible ? -99999 : (selectData?.x ?? -99999)}px - 50%), ${!selectData?.visible ? -99999 : (selectData?.y ?? -99999) + 18}px)`,
        }}
        onKeyDown={(e) => {
          // 阻止冒泡
          e.stopPropagation();
        }}
      >
        <AIChatInput
          placeholder="输入内容或者上传内容..."
          style={{ backgroundColor: "var(--semi-color-bg-1)", width: 700 }}
          renderConfigureArea={renderLeftMenu}
          renderTopSlot={renderTopSlot}
          showUploadButton={false}
          skillHotKey="/"
          skills={[
            {
              icon: <IconTemplateStroked />,
              value: "writing",
              label: "多机位九宫格",
            },
            {
              icon: <IconSearch />,
              value: "AI 编程",
              label: "AI coding",
            },
          ]}
        />
      </div>
      <div
        style={{
          zIndex: 1,
          position: "absolute",
          transform: `translate(calc(${vvGlobal.connector?.mode !== "add" ? -99999 : (vvGlobal.connector?.menuAt?.x ?? -99999)}px - 50%), ${vvGlobal.connector?.mode !== "add" ? -99999 : (vvGlobal.connector?.menuAt?.y ?? -99999) + 18}px)`,
        }}
        onKeyDown={(e) => {
          // 阻止冒泡
          e.stopPropagation();
        }}
      >
        <Card bodyStyle={{ padding: 0 }}>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                const _app = vvGlobal.app;
                if (!_app || !vvGlobal.connector?.addAt) return;

                _app.lockLayout();

                const vvImage = VvImage.one(
                  {
                    id: v4(),
                    editable: true,
                    urls: [
                      "https://files.tapnow.top/api/conversation/storage/uploads/d0fce519-9c82-4d4b-9c8d-6e384b2fe0f0",
                    ],
                    preNodes: vvGlobal.connector?.fromNode
                      ? [vvGlobal.connector.fromNode.id]
                      : [],
                    around: "center",
                  },
                  vvGlobal.connector.addAt.x,
                  vvGlobal.connector.addAt.y,
                );

                const transform = { ...vvImage.localTransform };
                vvImage.around = "top-left";
                vvImage.setTransform(transform);

                _app.tree.add(vvImage);
                _app.unlockLayout();
                vvGlobal.unsetConnector();
                updateConnector();
                _app.editor.select(vvImage);
              }}
            >
              图片
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const _app = vvGlobal.app;
                if (!_app || !vvGlobal.connector?.addAt) return;

                _app.lockLayout();

                const vvText = VvText.one(
                  {
                    id: v4(),
                    editable: true,
                    text: "",
                    around: "center",
                    preNodes: vvGlobal.connector?.fromNode
                      ? [vvGlobal.connector.fromNode.id]
                      : [],
                  },
                  vvGlobal.connector.addAt.x,
                  vvGlobal.connector.addAt.y,
                );

                const transform = { ...vvText.localTransform };
                vvText.around = "top-left";
                vvText.setTransform(transform);

                _app.tree.add(vvText);
                _app.unlockLayout();
                vvGlobal.unsetConnector();
                updateConnector();
                _app.editor.select(vvText);
              }}
            >
              文本
            </Dropdown.Item>
          </Dropdown.Menu>
        </Card>
      </div>
    </>
  );
});
