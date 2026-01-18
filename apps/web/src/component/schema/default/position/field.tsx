import {
  Button,
  Input,
  InputNumber,
  Modal,
  Space,
  withField,
} from "@douyinfe/semi-ui";
import { CSSProperties, useCallback, useEffect, useState } from "react";

export type PositionProps = {
  value?: any;
  onChange?: any;
  style?: CSSProperties;
  addressEditable?: boolean;
};

export const LngLatPicker = ({
  value,
  onChange,
  style,
  addressEditable = false,
}: PositionProps) => {
  const [visible, setVisible] = useState(false);

  const positionChange = useCallback((event: any) => {
    // 接收位置信息，用户选择确认位置点后选点组件会触发该事件，回传用户的位置信息
    const loc = event.data;
    if (loc && loc.module === "locationPicker") {
      // 防止其他应用也会向该页面post信息，需判断module是否为'locationPicker'
      onChange(loc);
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", positionChange, false);
    return () => {
      window.removeEventListener("message", positionChange);
    };
  }, [visible]);

  return (
    <>
      {visible ? (
        <Modal
          visible={true}
          title="请选择下列任一项地址"
          footer={null}
          width={600}
          onCancel={() => {
            setVisible(false);
          }}
        >
          <div style={{ width: "100%", height: "80vh" }}>
            <iframe
              id="mapPage"
              width="100%"
              height="100%"
              frameBorder={0}
              src={`https://apis.map.qq.com/tools/locpicker?search=1&mapdraggable=0&type=1&key=${
                import.meta.env.VITE_MAP_KEY
              }&referer=${import.meta.env.VITE_MAP_REFERER}&coord=${
                value?.latlng?.lat && value.latlng.lng
                  ? `${value?.latlng.lat},${value.latlng.lng}`
                  : ""
              }`}
            />
          </div>
        </Modal>
      ) : null}
      <div style={style}>
        <div>
          <Space>
            <span>经度(lng): </span>
            <InputNumber
              style={{ width: 170 }}
              value={value?.latlng?.lng}
              readonly
            />
            <span>纬度(lat): </span>
            <InputNumber
              style={{ width: 170 }}
              value={value?.latlng?.lat}
              readonly
            />
            <Button
              onClick={() => {
                setVisible(true);
              }}
            >
              地图选点
            </Button>
          </Space>
        </div>
        <div>
          <Space style={{ marginTop: 8 }}>
            <span>具体地址: </span>
            <Input
              style={{ width: 505 }}
              value={value?.poiaddress}
              readonly={!addressEditable}
              onChange={(poiaddress) => {
                if (addressEditable) {
                  onChange?.({
                    ...value,
                    poiaddress,
                  });
                }
              }}
            />
          </Space>
        </div>
      </div>
    </>
  );
};

export const LngLatPickerFiled = withField(LngLatPicker);
