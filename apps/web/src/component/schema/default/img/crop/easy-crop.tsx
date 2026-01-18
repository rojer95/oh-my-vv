import { forwardRef, useImperativeHandle, useState } from "react";

import "cropperjs/dist/cropper.css";
import Cropper from "react-cropper";

type EasyCropProps = {
  image: string;
} & Cropper.Options;

type CropperRef = Cropper | null;
const EasyCrop = forwardRef<any, EasyCropProps>(
  ({ image, aspectRatio = 1, viewMode = 2, ...rest }, ref) => {
    const [instance, setInstance] = useState<CropperRef>(null);

    useImperativeHandle(ref, () => instance, [instance]);

    return (
      <>
        <Cropper
          {...rest}
          viewMode={viewMode}
          src={image}
          style={{ height: "50vh", width: "100%" }}
          onInitialized={(ins) => {
            setInstance(ins);
          }}
          aspectRatio={aspectRatio}
        />
      </>
    );
  },
);

export default EasyCrop;
