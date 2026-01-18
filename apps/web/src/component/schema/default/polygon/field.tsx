import { IconHelpCircle } from "@douyinfe/semi-icons";
import {
  Button,
  Modal,
  Radio,
  RadioGroup,
  Space,
  Tag,
  Toast,
  Tooltip,
  withField,
} from "@douyinfe/semi-ui";
import { flatten, isArray } from "lodash-es";
import { CSSProperties, useRef, useState } from "react";

export type PolygonEditorProps = {
  value?: any;
  onChange?: any;
  style?: CSSProperties;
  center?: { lng: number; lat: number };
};

export const PolygonEditor = ({
  value,
  onChange,
  style,
  center,
}: PolygonEditorProps) => {
  const [visible, setVisible] = useState(false);

  const editor = useRef<any>();
  const map = useRef<any>();
  const polygon = useRef<any>();
  const [mode, setMode] = useState(
    window.TMap.tools.constants.EDITOR_ACTION.DRAW
  );

  const close = () => {
    setVisible(false);
    polygon.current?.destroy();
    polygon.current = undefined;
    editor.current?.destroy();
    editor.current = undefined;
    map.current?.destroy();
    map.current = undefined;
  };

  const onError = () => {
    Toast.warning("仅支持简单多边形");
  };

  const initMap = () => {
    // 初始化几何图形及编辑器

    const geometries: any[] = [];

    let actionMode = window.TMap.tools.constants.EDITOR_ACTION.DRAW;

    let centerPosition = new window.TMap.LatLng(
      center?.lat ?? 39.984104,
      center?.lng ?? 116.307503
    );

    if (isArray(value) && value.length > 0) {
      actionMode = window.TMap.tools.constants.EDITOR_ACTION.INTERACT;
      setMode(window.TMap.tools.constants.EDITOR_ACTION.INTERACT);
      for (const paths of value) {
        geometries.push({
          paths,
        });
      }
    }

    map.current = new window.TMap.Map("map-container", {
      zoom: 17, // 设置地图缩放级别
      center: centerPosition,
    });

    polygon.current = new window.TMap.MultiPolygon({
      map: map.current,
      geometries,
    });

    editor.current = new window.TMap.tools.GeometryEditor({
      // TMap.tools.GeometryEditor 文档地址：https://lbs.qq.com/webApi/javascriptGL/glDoc/glDocEditor
      map: map.current, // 编辑器绑定的地图对象
      overlayList: [
        {
          overlay: polygon.current,
          id: "polygon",
        },
      ],
      actionMode, // 编辑器的工作模式
      activeOverlayId: "polygon",
      selectable: true, // 开启点选功能
      snappable: true, // 开启吸附
    });

    setTimeout(() => {
      if (geometries.length > 0) {
        //创建LatLngBounds实例
        const latlngBounds = new window.TMap.LatLngBounds();
        //将坐标逐一做为参数传入extend方法，latlngBounds会根据传入坐标自动扩展生成
        for (const point of flatten(geometries.map((i) => i.paths))) {
          latlngBounds.extend(new window.TMap.LatLng(point.lat, point.lng));
        }

        //调用fitBounds自动调整地图显示范围
        map.current.fitBounds(latlngBounds, { padding: 30 });
      }
    }, 500);

    editor.current.on("draw_error", onError);
    editor.current.on("adjust_error", onError);
  };

  return (
    <>
      {visible ? (
        <Modal
          visible={true}
          title="绘制区域"
          footer={<div></div>}
          width={1200}
          onCancel={() => {
            close();
          }}
          keepDOM={false}
          closeOnEsc={false}
          centered
        >
          <Space style={{ width: "100%" }}>
            <RadioGroup
              onChange={(e) => {
                editor.current.setActionMode(e.target.value);
                setMode(e.target.value);
              }}
              value={mode}
              type="button"
            >
              <Radio value={window.TMap.tools.constants.EDITOR_ACTION.DRAW}>
                绘制
              </Radio>
              <Radio value={window.TMap.tools.constants.EDITOR_ACTION.INTERACT}>
                编辑
              </Radio>
            </RadioGroup>

            <Tooltip
              content={
                <div style={{ whiteSpace: "pre-line" }}>
                  {mode === window.TMap.tools.constants.EDITOR_ACTION.DRAW
                    ? "绘制：鼠标左键点击及移动即可绘制图形\n结束绘制：鼠标左键双击即可结束绘制折线、多边形会自动闭合；圆形、矩形、椭圆单击即可结束\n中断：绘制过程中按下esc键可中断该过程"
                    : "单选：鼠标左键点击图形 多选：按下ctrl键后点击多个图形\n删除：选中图形后按下delete键或点击删除按钮可删除图形\n编辑：选中图形后出现编辑点，拖动编辑点可移动顶点位置，双击实心编辑点可删除顶点\n拆分：选中单个多边形后可绘制拆分线，拆分线绘制完成后自动进行拆分\n合并：选中多个相邻多边形后可进行合并，飞地形式的多边形不支持合并\n中断：按下esc键可中断当前操作，点选的图形将取消选中，编辑过程将中断"}
                </div>
              }
            >
              <Button icon={<IconHelpCircle />} theme="borderless" />
            </Tooltip>

            <Button
              style={{ marginLeft: "auto" }}
              theme="solid"
              onClick={() => {
                editor.current.setActionMode(
                  window.TMap.tools.constants.EDITOR_ACTION.DRAW
                );
                setMode(window.TMap.tools.constants.EDITOR_ACTION.DRAW);
                setTimeout(() => {
                  const areas = polygon.current
                    .getGeometries()
                    ?.map((i: any) => i.paths);
                  onChange(areas.length === 0 ? undefined : areas);
                  close();
                }, 0);
              }}
            >
              保存
            </Button>
          </Space>
          <br />
          <br />
          <div
            id="map-container"
            style={{ width: "100%", height: "80vh" }}
          ></div>
        </Modal>
      ) : null}
      <div style={style}>
        <div>
          <Space>
            <Tag>
              {isArray(value) && value.length > 0
                ? `${value.length}个区域`
                : "未配置"}
            </Tag>
            <Button
              onClick={() => {
                setVisible(true);
                setTimeout(() => {
                  initMap();
                }, 300);
              }}
            >
              绘制区域
            </Button>
          </Space>
        </div>
      </div>
    </>
  );
};

export const PolygonEditorFiled = withField(PolygonEditor);
