import { Button, Input, Popover, Space, withField } from "@douyinfe/semi-ui";
import { useState } from "react";
import { SketchPicker } from "react-color";
import tinycolor from "tinycolor2";
import { PickerBox, Rect } from "./style";

const toRgbString = (rgb: any) => tinycolor(rgb).toRgbString();
const toRgb = (rgbStr: any) => tinycolor(rgbStr).toRgb();

export const ColorPicker = ({
  value,
  onChange,
  needConfirm = true,
  showInput = false,
  initColor = undefined,
  style = {},
}: any) => {
  const [visible, setVisible] = useState(false);
  const [pickColor, setPickColor] = useState<any>(undefined);

  return (
    <Space>
      <Popover
        trigger="custom"
        visible={visible}
        onClickOutSide={() => {
          if (!needConfirm && visible) {
            setVisible(false);
          }
        }}
        content={
          <PickerBox>
            <SketchPicker
              color={pickColor}
              onChange={(e) => {
                setPickColor(e.rgb);
                if (!needConfirm) {
                  onChange(toRgbString(e.rgb));
                }
              }}
            />
            {needConfirm ? (
              <div className="btns">
                <Button
                  onClick={() => {
                    onChange(toRgbString(pickColor));
                    setVisible(false);
                  }}
                  block
                >
                  确认
                </Button>
                <Button
                  onClick={() => {
                    setVisible(false);
                  }}
                  block
                >
                  取消
                </Button>
              </div>
            ) : null}
          </PickerBox>
        }
      >
        <Rect
          color={value || initColor}
          onClick={() => {
            setPickColor(toRgb(value || initColor));
            setVisible(true);
          }}
          style={style}
        />
      </Popover>
      {showInput ? (
        <Input
          value={value || initColor}
          onChange={(v) => {
            onChange(v);
          }}
        />
      ) : null}
      {initColor ? (
        <Button
          size="small"
          onClick={() => {
            onChange(initColor);
          }}
        >
          重置
        </Button>
      ) : null}
    </Space>
  );
};

export const ColorPickerField = withField(ColorPicker);
