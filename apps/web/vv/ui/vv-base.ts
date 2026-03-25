import {
  boundsType,
  Box,
  BoxData,
  IBoxData,
  IBoxInputData,
  Rect,
} from "leafer-ui";
import { vvGlobal } from "../mobx/vv-global";

export interface IVvBaseInputData extends IBoxInputData {
  generating?: boolean;
}

export interface IVvBaseData extends IBoxData {
  generating?: boolean;
}

export class VvBaseData extends BoxData implements IVvBaseData {}

export class VvBase extends Box {
  @boundsType(false)
  declare public generating: boolean;

  constructor(input: IVvBaseInputData) {
    super(input);
    this.editConfig = {
      ...this.editConfig,
    };

    this.width = 640;
    this.height = 640;
    this.hitBox = true;
    this.cornerRadius = 8;
    this.stroke = "rgba(255, 255, 255, 0.4)";
    this.strokeWidth = 2;
    this.strokeAlign = "outside";
    this.strokeScaleFixed = "zoom-in";
    this.childlessJSON = true;
  }

  protected renderGenerating() {
    this.remove(".generating");
    if (this.generating) {
      vvGlobal.pushGeneratingNodeId(this.id!);
      this.add(
        Rect.one({
          x: 0,
          y: 0,
          width: this.width,
          height: this.height,
          fill: "rgba(255, 255, 255, 0.1)",
          animation: {
            style: { fill: "rgba(255, 255, 255, 0.6)" },
            duration: 1,
            swing: true,
          },
          className: "generating",
          editable: false,
          hittable: false,
        }),
      );
    } else {
      vvGlobal.popGeneratingNodeId(this.id!);
    }
  }
}
