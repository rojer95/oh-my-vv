import { IconCamera } from "@douyinfe/semi-icons";
import { Button, Modal, Toast } from "@douyinfe/semi-ui";
import { useRef, useState } from "react";

const DEFAULT_CHILDREN = (
  <Button type="primary" icon={<IconCamera />}>
    拍照上传
  </Button>
);

export const TakePicture = ({ onChange, children }: any) => {
  const [visible, setVisible] = useState(false);
  const [size, setSize] = useState<any>({ width: 640, height: 480 });
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);

  function successFunc(mediaStream: MediaProvider) {
    const video = cameraVideoRef.current;
    if (!video) return;
    if ("srcObject" in video) {
      video.srcObject = mediaStream;
    }
    video.onloadedmetadata = () => {
      video.play();
    };
  }

  function errorFunc(err: Error) {
    Toast.error(`启动摄像头失败:${err.message}`);
  }

  // 启动摄像头
  const openMedia = () => {
    // 打开摄像头
    const opt = {
      audio: false,
      video: {},
    };
    navigator.mediaDevices.getUserMedia(opt).then(successFunc).catch(errorFunc);
  };

  // 关闭摄像头
  const closeMedia = () => {
    const video = cameraVideoRef.current;
    if (!video) return;
    const stream = video.srcObject;
    if (!stream) return;
    if ("getTracks" in stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    }
  };

  const getImg = () => {
    return new Promise<Blob>((resolve, reject) => {
      const video = cameraVideoRef.current;
      const canvas = cameraCanvasRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight); // 把视频中的一帧在canvas画布里面绘制出来
      canvas.toBlob((blob) => {
        if (!blob) {
          reject();
        } else {
          resolve(blob);
          closeMedia();
        }
      }, "image/png"); // 将图片资源转成字符串
    });
  };

  return (
    <>
      <Modal
        visible={visible}
        title="拍照"
        onCancel={() => {
          closeMedia();
          setVisible(false);
        }}
        width={size.width + 48}
        okText="拍照"
        onOk={async () => {
          const blob = await getImg();
          onChange?.(new File([blob], "pic.png", { type: "image/png" }));
          setVisible(false);
        }}
      >
        <video
          ref={cameraVideoRef}
          style={{
            width: size.width,
            height: size.height,
            border: "1px solid var(--semi-color-border)",
            backgroundColor: "var(--semi-color-fill-0)",
          }}
          onPlaying={() => {
            setSize({
              width: Math.max(cameraVideoRef.current?.videoWidth || 0, 200),
              height: Math.max(cameraVideoRef.current?.videoHeight || 0, 200),
            });
          }}
        />
        <canvas
          ref={cameraCanvasRef}
          width={size.width}
          height={size.height}
          style={{
            visibility: "hidden",
            width: "1px",
            height: "1px",
          }}
        />
      </Modal>
      <span
        onClick={() => {
          setVisible(true);
          setTimeout(() => {
            openMedia();
          }, 500);
        }}
      >
        {children || DEFAULT_CHILDREN}
      </span>
    </>
  );
};
