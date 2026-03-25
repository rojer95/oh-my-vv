import { Card, Dropdown } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { v4 } from "uuid";
import { vvGlobal } from "../../mobx/vv-global";
import { VvImage } from "../../ui/vv-image";
import { VvText } from "../../ui/vv-text";

export const AddNodeMenu = observer(() => {
  return (
    <>
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
                _app.addOne(
                  VvImage.one(
                    {
                      id: v4(),
                      editable: true,
                      urls: [],
                      preNodes: vvGlobal.connector?.fromNode
                        ? [vvGlobal.connector.fromNode.id]
                        : [],
                      around: "center",
                    },
                    vvGlobal.connector.addAt.x,
                    vvGlobal.connector.addAt.y,
                  ),
                );
              }}
            >
              上传图片
            </Dropdown.Item>

            <Dropdown.Item
              onClick={() => {
                const _app = vvGlobal.app;
                if (!_app || !vvGlobal.connector?.addAt) return;

                _app.addOne(
                  VvText.one(
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
                  ),
                );
              }}
            >
              文本生成
            </Dropdown.Item>

            <Dropdown.Item
              onClick={() => {
                const _app = vvGlobal.app;
                if (!_app || !vvGlobal.connector?.addAt) return;
                _app.addOne(
                  VvImage.one(
                    {
                      id: v4(),
                      editable: true,
                      urls: [],
                      preNodes: vvGlobal.connector?.fromNode
                        ? [vvGlobal.connector.fromNode.id]
                        : [],
                      around: "center",
                    },
                    vvGlobal.connector.addAt.x,
                    vvGlobal.connector.addAt.y,
                  ),
                );
              }}
            >
              图片生成
            </Dropdown.Item>
          </Dropdown.Menu>
        </Card>
      </div>
    </>
  );
});
