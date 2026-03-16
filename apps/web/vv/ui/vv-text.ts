import {
  BoundsEvent,
  Box,
  BoxData,
  dataProcessor,
  dataType,
  IBoxData,
  IBoxInputData,
  registerUI,
  surfaceType,
  Text,
} from "leafer-ui";

interface IVvTextInputData extends IBoxInputData {
  text?: string;
  preNodes?: string[];
}

interface IVvTextData extends IBoxData {
  text?: string;
  preNodes?: string[];
}

class VvTextData extends BoxData implements IVvTextData {}

@registerUI()
export class VvText extends Box {
  public override get __tag() {
    return "VvText";
  }

  @dataProcessor(VvTextData)
  declare public __: IVvTextData;

  @surfaceType("")
  declare public text: string;

  @dataType([])
  declare public preNodes: string[];

  private textNode: Text | undefined = undefined;
  private scrollBoxNode: Box | undefined = undefined;

  constructor(input: IVvTextInputData) {
    super(input);
    this.editConfig = {
      ...this.editConfig,
      resizeable: true,
    };

    this.textBox = true;
    this.overflow = "hide";
    this.width = 640;
    this.height = 640;
    this.cornerRadius = 8;
    this.fill = "rgba(35, 36, 41, 1)";
    this.stroke = "rgba(255, 255, 255, 0.4)";
    this.strokeWidth = 2;
    this.strokeAlign = "outside";
    this.strokeScaleFixed = "zoom-in";
    this.childlessJSON = true;
    this.loadText();
    this.on([BoundsEvent.RESIZE], (e) => {
      if (this.scrollBoxNode) {
        this.scrollBoxNode.width = e.width;
        this.scrollBoxNode.height = e.height;
      }

      if (this.textNode) {
        this.textNode.width = e.width;
        this.textNode.height = e.height;
      }
    });
  }

  loadText() {
    if (!this.textNode) {
      this.textNode = new Text({
        text: this.text,
        fill: "#FFFFFF",
        padding: 8,
        fontSize: 14,
        placeholder: "请输入",
      });

      this.scrollBoxNode = new Box({
        width: 640,
        height: 640,
        textBox: true,
        overflow: "y-scroll",
        scrollConfig: {
          strokeWidth: 0,
          stopDefault: true,
        },
      });

      this.scrollBoxNode.add(this.textNode);
      this.add(this.scrollBoxNode);
    }
  }
}
