import { Button } from "@douyinfe/semi-ui";
import { ButtonProps } from "@douyinfe/semi-ui/lib/es/button";
import { PropsWithChildren, useEffect, useRef, useState } from "react";

export const TimerButton = ({
  children,
  onClick,
  ...buttonProps
}: PropsWithChildren<
  {
    onClick: () => Promise<boolean>;
  } & Omit<ButtonProps, "onClick">
>) => {
  const timer = useRef<NodeJS.Timer>();
  const [t, setT] = useState(0);

  const stopTT = () => {
    if (timer.current) {
      clearInterval(timer.current);
      setT(0);
    }
  };

  const startTT = () => {
    stopTT();
    setT(60);

    timer.current = setInterval(() => {
      setT((_t) => {
        if (_t <= 0) {
          stopTT();
          return 0;
        }
        return _t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      stopTT();
    };
  }, []);

  return (
    <Button
      {...buttonProps}
      disabled={t > 0}
      onClick={async () => {
        const res = await onClick?.();
        if (res === true) {
          startTT();
        }
      }}
    >
      {children}
      {t > 0 ? `(${t}s)` : ""}
    </Button>
  );
};
