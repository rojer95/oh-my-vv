import { Image, ImagePreview } from "@douyinfe/semi-ui";

import { IconPlus } from "@douyinfe/semi-icons";

import ImgCrop from "./crop/img-crop";
import { ImgCropProps } from "./crop/typing";

import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { UploadProps } from "@/component/upload";
import { Upload } from "../file/field";

export const img = {
  render: (props) => {
    const { style } = props;
    let v = [];
    if (Array.isArray(props.value)) {
      v = props.value;
    } else if (props.value) {
      v = [props.value];
    }

    return v?.length > 0 ? (
      <ImagePreview>
        {v.map((i) => (
          <Image height={30} key={i} src={i} style={style} />
        ))}
      </ImagePreview>
    ) : (
      "-"
    );
  },
  renderForm: ({ cropProps, ...props }) => {
    const uploadConpoment = (
      <Upload {...props} listType="picture" accept=".jpeg,.jpg,.png,.gif">
        <IconPlus size="extra-large" />
      </Upload>
    );

    return cropProps ? (
      <div>
        <ImgCrop {...cropProps}>{uploadConpoment}</ImgCrop>
      </div>
    ) : (
      uploadConpoment
    );
  },
} as SchemaDefined;

export type ImgColumn = SchemaColumnBase<
  "img",
  {
    cropProps?: ImgCropProps;
  } & Omit<UploadProps, "value" | "onChange" | "listType" | "accept">
>;
