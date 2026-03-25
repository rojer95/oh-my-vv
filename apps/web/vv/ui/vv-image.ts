import {
  boundsType,
  dataProcessor,
  dataType,
  Image,
  ImageEvent,
  PropertyEvent,
  registerUI,
} from "leafer-ui";
import placeholderImg from "../asset/temp-image.svg";
import { vvGlobal } from "../mobx/vv-global";
import { IVvBaseData, IVvBaseInputData, VvBase, VvBaseData } from "./vv-base";

interface AiProps {
  imgProps?: {
    imageSize?: string; // 分辨率
    aspectRatio?: string; // 比例
  };
  content?: string; // 提示词
  model?: string; // 模型
  provider?: string; //模型提供商
}

interface IVvImageInputData extends IVvBaseInputData {
  url?: string;
  alternativeUrls?: string[];
  preNodes?: string[];
  aiProps?: AiProps;
}

interface IVvImageData extends IVvBaseData {
  url?: string;
  alternativeUrls?: string[];
  preNodes?: string[];
  aiProps?: AiProps;
}

class VvImageData extends VvBaseData implements IVvImageData {}

@registerUI()
export class VvImage extends VvBase {
  public override get __tag() {
    return "VvImage";
  }

  @dataProcessor(VvImageData)
  declare public __: IVvImageData;

  @boundsType(undefined)
  declare public url: string | undefined;

  @boundsType([])
  declare public alternativeUrls: string[];

  @boundsType(false)
  declare public generating: boolean;

  @dataType([])
  declare public preNodes: string[];

  @dataType({
    imgProps: {
      aspectRatio: "16:9",
      imageSize: "2k",
    },
    model: "nano-banana-pro",
    provider: "google",
  })
  declare public aiProps: AiProps;

  private imgNode: Image | undefined = undefined;
  private placeholderNode: Image | undefined = undefined;

  constructor(input: IVvImageInputData) {
    super(input);
    this.width = 640;
    this.height = 640;
    this.updateImage();

    this.on(PropertyEvent.CHANGE, (e) => {
      if (e.attrName === "url" || e.attrName === "alternativeUrls") {
        this.updateImage();
      }

      if (e.attrName === "generating") {
        this.renderGenerating();
      }
    });
  }

  private calculateImageSize(
    originalWidth: number,
    originalHeight: number,
    maxWidth = 640,
    maxHeight = 640,
  ) {
    const ratio = Math.min(
      maxWidth / originalWidth,
      maxHeight / originalHeight,
    );
    return {
      width: originalWidth * ratio,
      height: originalHeight * ratio,
    };
  }

  private updateImage() {
    this.generating = false;
    this.renderGenerating();

    this.remove(".backupImage");
    for (let index = 0; index < (this.alternativeUrls || []).length; index++) {
      const backupImageUrl = (this.alternativeUrls || [])[index];
      this.add(
        new Image({
          x: 0,
          y: 0,
          url: backupImageUrl,
          editable: false,
          dimskip: true,
          cornerRadius: 8,
          rotation: -4 * (index + 1),
          origin: "center",
          opacity: 0.2,
          className: "backupImage",
        }),
      );
    }

    if (this.url) {
      if (this.placeholderNode) {
        this.remove(this.placeholderNode);
      }

      if (this.imgNode) {
        this.imgNode.destroy();
        this.remove(this.imgNode);
      }

      this.imgNode = new Image({
        x: 0,
        y: 0,
        url: this.url,
        editable: false,
        dimskip: true,
        cornerRadius: 8,
        rotation: 0,
        origin: "center",
      });

      this.add(this.imgNode);

      this.imgNode.on(ImageEvent.LOADED, (e) => {
        const { width, height } = this.calculateImageSize(
          e.image.width,
          e.image.height,
        );

        this.imgNode!.width = this.width = width;
        this.imgNode!.height = this.height = height;

        this.find(".backupImage").forEach((i) => {
          i.width = width;
          i.height = height;
        });

        // 根据工具栏尺寸
        this.nextRender(() => {
          vvGlobal.updateToolPosition();
        });
      });
    } else {
      this.placeholderNode = Image.one({
        editable: false,
        width: this.width! / 3,
        height: this.height! / 3,
        x: this.width! / 2,
        y: this.height! / 2,
        around: "center",
        url: placeholderImg,
      });
      this.add(this.placeholderNode);
    }
  }

  public generateImage(aiProps: AiProps) {
    this.set({
      aiProps,
      generating: true,
    });

    setTimeout(() => {
      // 模拟AI生成结束
      this.set({
        generating: false,
        url: "https://files.tapnow.top/api/conversation/storage/uploads/2185be2c-4570-40d3-96c1-c45e2b1aa60f?variant_name=small",
        alternativeUrls: [
          "https://files.tapnow.top/api/conversation/storage/uploads/2185be2c-4570-40d3-96c1-c45e2b1aa60f?variant_name=small",
        ],
      });
    }, 3000);
  }

  override destroy(): void {
    this.off([PropertyEvent.CHANGE]);
    this.destroy();
  }
}
