import { IconChevronDown, IconMaximize } from "@douyinfe/semi-icons";
import {
  Card,
  Divider,
  Form,
  getConfigureItem,
  Popover,
  Space,
} from "@douyinfe/semi-ui";

import "./index.less";

const ImageSizeOptions = [
  { label: "1K", value: "1k" },
  { label: "2K", value: "2k" },
  { label: "4K", value: "4k" },
];

const AspectRatioOptions = [
  {
    icon: <IconMaximize />,
    label: "自适应",
    value: "auto",
  },
  {
    icon: (
      <span
        style={{
          border: "1px solid currentColor",
          width: 21 * 0.7,
          height: 9 * 0.7,
          borderRadius: 3,
        }}
      />
    ),
    label: "21:9",
    value: "21:9",
  },
  {
    icon: (
      <span
        style={{
          border: "1px solid currentColor",
          width: 16 * 0.8,
          height: 9 * 0.8,
          borderRadius: 3,
        }}
      ></span>
    ),
    label: "16:9",
    value: "16:9",
  },
  {
    icon: (
      <span
        style={{
          border: "1px solid currentColor",
          width: 3 * 4,
          height: 2 * 4,
          borderRadius: 3,
        }}
      ></span>
    ),
    label: "3:2",
    value: "3:2",
  },
  {
    icon: (
      <span
        style={{
          border: "1px solid currentColor",
          width: 4 * 3,
          height: 3 * 3,
          borderRadius: 3,
        }}
      ></span>
    ),
    label: "4:3",
    value: "4:3",
  },
  {
    icon: (
      <span
        style={{
          border: "1px solid currentColor",
          width: 1 * 10,
          height: 1 * 10,
          borderRadius: 3,
        }}
      ></span>
    ),
    label: "1:1",
    value: "1:1",
  },
  {
    icon: (
      <span
        style={{
          border: "1px solid currentColor",
          width: 3 * 3,
          height: 4 * 3,
          borderRadius: 3,
        }}
      ></span>
    ),
    label: "3:4",
    value: "3:4",
  },
  {
    icon: (
      <span
        style={{
          border: "1px solid currentColor",
          width: 2 * 4,
          height: 3 * 4,
          borderRadius: 3,
        }}
      ></span>
    ),
    label: "2:3",
    value: "2:3",
  },
  {
    icon: (
      <span
        style={{
          border: "1px solid currentColor",
          width: 9 * 0.8,
          height: 16 * 0.8,
          borderRadius: 3,
        }}
      ></span>
    ),
    label: "9:16",
    value: "9:16",
  },
];

export const SizeBox = getConfigureItem(
  ({ value, onChange, className }: any) => {
    return (
      <Popover
        trigger="click"
        position="bottomLeft"
        content={
          <Card className="semi-aiChatInput-footer-configure-sizebox">
            <div>
              <Form.Label>画质</Form.Label>
            </div>
            <div>
              <div className="radio">
                {ImageSizeOptions.map((item) => (
                  <div
                    className={`radio-item ${item.value === value?.imageSize ? "active" : ""}`}
                    onClick={() => {
                      onChange({ ...(value || {}), imageSize: item.value });
                    }}
                    key={item.value}
                  >
                    <div>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Form.Label>比例</Form.Label>
            </div>
            <div>
              <div className="radio">
                {AspectRatioOptions.map((item) => (
                  <div
                    className={`radio-item ${item.value === value?.aspectRatio ? "active" : ""}`}
                    onClick={() => {
                      onChange({ ...(value || {}), aspectRatio: item.value });
                    }}
                    key={item.value}
                  >
                    {item.icon ? (
                      <div className="radio-icon">{item.icon}</div>
                    ) : null}
                    <div>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        }
      >
        <div
          className={`${className} semi-select semi-aiChatInput-footer-configure-select semi-select-single`}
        >
          <div className="semi-select-selection">
            <div className="semi-select-content-wrapper">
              <Space className="semi-select-selection-text">
                {
                  AspectRatioOptions.find((i) => i.value === value?.aspectRatio)
                    ?.icon
                }
                {
                  AspectRatioOptions.find((i) => i.value === value?.aspectRatio)
                    ?.label
                }
                <Divider layout="vertical" style={{ height: 8 }} />
                {
                  ImageSizeOptions.find((i) => i.value === value?.imageSize)
                    ?.label
                }
              </Space>
            </div>
          </div>
          <div className="semi-select-arrow" x-semi-prop="arrowIcon">
            <IconChevronDown />
          </div>
        </div>
      </Popover>
    );
  },
);
