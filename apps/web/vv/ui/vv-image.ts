import {
  Box,
  BoxData,
  dataProcessor,
  dataType,
  IBoxData,
  IBoxInputData,
  Image,
  ImageEvent,
  registerUI,
  surfaceType,
} from "leafer-ui";

interface IVvImageInputData extends IBoxInputData {
  urls?: string[];
  size?: [number, number, number];
  preNodes?: string[];
}

interface IVvImageData extends IBoxData {
  urls?: string[];
  size?: [number, number, number];
  preNodes?: string[];
}

class VvImageData extends BoxData implements IVvImageData {}

@registerUI()
export class VvImage extends Box {
  public override get __tag() {
    return "VvImage";
  }

  @dataProcessor(VvImageData)
  declare public __: IVvImageData;

  @surfaceType([])
  declare public urls: string[];

  @dataType([])
  declare public preNodes: string[];

  private activeImg: Image | undefined = undefined;

  constructor(input: IVvImageInputData) {
    super(input);
    this.editConfig = {
      ...this.editConfig,
    };

    this.width = 0;
    this.cornerRadius = 8;
    this.stroke = "rgba(255, 255, 255, 0.4)";
    this.strokeWidth = 2;
    this.strokeAlign = "outside";
    this.strokeScaleFixed = "zoom-in";
    this.childlessJSON = true;

    this.loadImage();
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

  private loadImage() {
    const backupImageUrls = (this.urls || []).slice(1).reverse();
    for (let index = 0; index < backupImageUrls.length; index++) {
      const backupImageUrl = backupImageUrls[index];
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
          name: "backupImage",
        }),
      );
    }

    const activeUrl = this.urls?.[0];

    if (activeUrl) {
      this.activeImg = new Image({
        x: 0,
        y: 0,
        url: activeUrl,
        editable: false,
        dimskip: true,
        cornerRadius: 8,
        rotation: 0,
        origin: "center",
      });

      this.add(this.activeImg);

      this.activeImg.on(ImageEvent.LOADED, (e) => {
        const { width, height } = this.calculateImageSize(
          e.image.width,
          e.image.height,
        );

        this.activeImg!.width = this.width = width;
        this.activeImg!.height = this.height = height;

        this.find((i) => (i.name === "backupImage" ? 1 : 0)).forEach((i) => {
          i.width = width;
          i.height = height;
        });
      });
    }
  }
}
