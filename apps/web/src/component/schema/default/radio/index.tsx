import { Form } from "@douyinfe/semi-ui";
import { RadioGroupProps } from "@douyinfe/semi-ui/lib/es/radio";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { optionsUtils } from "../../util";
import { TagDisplay } from "../common/tag";

export const radio = {
  render: (props) => {
    if (props?.tag) {
      return <TagDisplay {...props} />;
    }
    return optionsUtils.getLabelStringByValue(
      props?.options,
      props?.value,
      props?.valueKey,
      props?.labelKey,
    );
  },
  renderForm: (props) => (
    <Form.RadioGroup
      {...props}
      options={optionsUtils.transfrom(
        props.options,
        props?.valueKey,
        props?.labelKey,
      )}
    />
  ),
} as SchemaDefined;

export type RadioColumn = SchemaColumnBase<"radio", RadioGroupProps>;
