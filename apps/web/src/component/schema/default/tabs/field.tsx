import {
  Button,
  Tabs as SemiTabs,
  Space,
  useFormApi,
  withField,
} from "@douyinfe/semi-ui";
import {
  PlainTab,
  TabsProps as SemiTabsProps,
} from "@douyinfe/semi-ui/lib/es/tabs";
import { omit } from "lodash-es";
import { SchemaFields } from "../../fields";
import { SchemaColumn } from "../../typing";
import { useState } from "react";

export type SchemaPlainTab = PlainTab & {
  columns: SchemaColumn[];
  width?: number | string;
};

export type TabsProps = Omit<SemiTabsProps, "tabList"> & {
  value?: any;
  tabList?: Array<SchemaPlainTab | undefined>;
  confirmText?: string;
  tabField: string;
  showStep?: boolean;
  initActiveKey?: string;
};

export const Tabs = ({
  tabList,
  value,
  onChange,
  confirmText = "确认",
  tabField,
  showStep = false,
  initActiveKey = "",
  ...props
}: TabsProps) => {
  const formApi = useFormApi();
  const [activeKey, setActiveKey] = useState(
    value || initActiveKey || tabList?.[0]?.itemKey
  );

  const notifyChange = (newKey: string) => {
    if (tabField) {
      onChange?.(newKey);
    }
    setActiveKey(newKey);
  };

  return (
    <SemiTabs
      {...props}
      activeKey={activeKey}
      onChange={notifyChange}
      className="_form_tabs"
    >
      {tabList?.map((tabItem) => {
        if (!tabItem) return;
        return (
          <SemiTabs.TabPane
            {...omit(tabItem, ["columns"])}
            key={tabItem.itemKey}
          >
            <div
              style={{
                width: tabItem.width ?? "100%",
                margin: "0px auto",
                padding: "0px 12px",
                boxSizing: "border-box",
              }}
            >
              <SchemaFields columns={tabItem?.columns || []} />
            </div>
          </SemiTabs.TabPane>
        );
      })}

      {showStep ? (
        <div style={{ textAlign: "center" }}>
          <Space>
            {activeKey !== tabList?.[0]?.itemKey ? (
              <Button
                onClick={() => {
                  const preItemKey =
                    tabList?.[
                      tabList?.findIndex((i) => i?.itemKey === activeKey) - 1
                    ]?.itemKey;

                  if (preItemKey) {
                    notifyChange(preItemKey);
                  }
                }}
              >
                上一步
              </Button>
            ) : null}
            {activeKey === tabList?.[tabList?.length - 1]?.itemKey ? (
              <Button
                theme="solid"
                onClick={() => {
                  formApi?.submitForm();
                }}
              >
                {confirmText}
              </Button>
            ) : (
              <Button
                theme="solid"
                onClick={() => {
                  const nextItemKey =
                    tabList?.[
                      tabList?.findIndex((i) => i?.itemKey === value) + 1
                    ]?.itemKey;

                  if (nextItemKey) {
                    notifyChange(nextItemKey);
                  }
                }}
              >
                下一步
              </Button>
            )}
          </Space>
        </div>
      ) : null}
    </SemiTabs>
  );
};

export const TabsField = withField(Tabs);
