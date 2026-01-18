import { Modal, Space, Tag, withField } from "@douyinfe/semi-ui";
import { cloneDeep } from "lodash-es";
import { useMemo, useState } from "react";
import { SectionStyle } from "../../style";

export const GroupSelect = ({
  value,
  onChange,
  options = [],
  title,
  style,
  placeholder = "",
}: any) => {
  const [visible, setVisible] = useState(false);
  const [tempValue, setTempValue] = useState<any[]>(value || []);

  const selected = useMemo(() => {
    return options
      ?.reduce((p: any[], i: any) => [...p, ...(i?.children || [])], [])
      ?.filter((i: any) => (value || []).includes(i.value));
  }, [options, value]);

  return (
    <>
      <Modal
        onOk={() => {
          setVisible(false);
          onChange(tempValue);
        }}
        onCancel={() => {
          setVisible(false);
        }}
        visible={visible}
        title={`${title?.text || title}`}
        width={800}
      >
        {options?.map((i: any) => {
          return (
            <SectionStyle key={i.value}>
              {i.label ? (
                <div className="section-title-box">
                  <div className="section-title">{i.label}</div>
                </div>
              ) : null}

              <div className="section-content">
                <Space>
                  {i?.children?.map?.((item: any) => {
                    const selected = (tempValue || []).includes(item.value);
                    return (
                      <Tag
                        key={item.value}
                        color={selected ? "blue" : "grey"}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setTempValue((pv) => {
                            if (pv.includes(item.value))
                              return pv.filter((pvi) => pvi !== item.value);
                            return [...pv, item.value];
                          });
                        }}
                      >
                        {item.label}
                      </Tag>
                    );
                  })}
                </Space>
              </div>
              <br />
            </SectionStyle>
          );
        })}
      </Modal>
      <div
        onClick={() => {
          setTempValue(value || []);
          setVisible(true);
        }}
        style={{
          cursor: "pointer",
          minHeight: 32,
          padding: 6,
          ...(style || {}),
        }}
        className="semi-input-wrapper "
      >
        <Space wrap>
          {selected?.length === 0 ? (
            <span
              className="semi-select-selection-text semi-select-selection-placeholder"
              x-semi-prop="placeholder"
              style={{ paddingLeft: 6 }}
            >
              {placeholder}
            </span>
          ) : null}
          {selected?.map((i: any) => (
            <Tag
              color="white"
              closable
              key={i.value}
              onClose={() => {
                onChange(
                  cloneDeep(value || []).filter((pvi: any) => pvi !== i.value)
                );
              }}
            >
              {i.label}
            </Tag>
          ))}
        </Space>
      </div>
    </>
  );
};

export const GroupSelectField = withField(GroupSelect);
