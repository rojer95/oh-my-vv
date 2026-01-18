import type { FC } from "react";

export interface ImgCropProps {
  modalTitle?: string;
  modalWidth?: number | string;
  modalOk?: string;
  modalCancel?: string;
  onModalOk?: (file: any) => void;
  onModalCancel?: () => void;

  onUploadFail?: (err: Error) => void;
  cropperProps?: Partial<Cropper.Options>;

  children: JSX.Element;
}

declare const ImgCrop: FC<ImgCropProps>;

export default ImgCrop;
