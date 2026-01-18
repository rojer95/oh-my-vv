import { Form } from "@douyinfe/semi-ui";
import { RadioGroupProps } from "@douyinfe/semi-ui/lib/es/radio";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { optionsUtils } from "../../util";
import { TagDisplay } from "../common/tag";

const defaultOptions = [
  {
    label: "是",
    value: true,
  },
  {
    label: "否",
    value: false,
  },
];

const defaultOptionsColor = {
  1: "green",
  0: "red",
};
export const _switch = {
  render: (props) => {
    return (
      <TagDisplay
        {...props}
        options={(props.options ?? defaultOptions).map((i: any) => {
          return {
            ...i,
            color: (props?.colors ?? defaultOptionsColor)?.[i.value ? 1 : 0],
          };
        })}
      />
    );
  },
  renderForm: (props) => {
    return props?.classic ? (
      <div style={props?.style}>
        <Form.Switch {...props} style={{}} />
      </div>
    ) : (
      <Form.RadioGroup
        {...props}
        options={optionsUtils.transfrom(props.options ?? defaultOptions)}
      />
    );
  },
} as SchemaDefined;

export type SwitchColumn = SchemaColumnBase<
  "switch",
  {
    value?: boolean;
    defaultValue?: boolean;
    classic?: boolean;
    colors?: Record<number, string>;
  } & Omit<RadioGroupProps, "defaultValue" | "value">
>;
