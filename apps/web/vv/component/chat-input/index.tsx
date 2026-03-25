import { useCallback, useEffect, useMemo } from "react";

import { IconSearch, IconTemplateStroked } from "@douyinfe/semi-icons";
import { AIChatInput, Avatar, Space } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { vvGlobal } from "../../mobx/vv-global";
import { VvImage } from "../../ui/vv-image";
import { VvText } from "../../ui/vv-text";
import { SizeBox } from "../size";
import { VvBase } from "vv/ui/vv-base";

const modelOptions = [
  { value: "GPT-5", label: "GPT-5" },
  { value: "GPT-4o", label: "GPT-4o" },
  { value: "Claude 3.5 Sonnet", label: "Claude 3.5 Sonnet" },
  { value: "nano-banana-pro", label: "Nano Banana Pro" },
];

export const ChatInput = observer(() => {
  const renderConfigureArea = useCallback(() => {
    if (!vvGlobal.activeNode) return null;
    return (
      <>
        <AIChatInput.Configure.Select
          key={`model_${vvGlobal.activeNode?.id}`}
          optionList={modelOptions}
          field="model"
          initValue={(vvGlobal.activeNode as VvImage)?.aiProps?.model}
        />
        {vvGlobal.activeNode?.tag === "VvImage" ? (
          <SizeBox
            key={`imgProps_${vvGlobal.activeNode?.id}`}
            field="imgProps"
            initValue={(vvGlobal.activeNode as VvImage)?.aiProps?.imgProps}
          />
        ) : null}
      </>
    );
  }, [vvGlobal.activeNode]);

  const renderTopSlot = useCallback(
    () => (
      <>
        <Space wrap style={{ marginBottom: 12 }}>
          {(vvGlobal.activeNode as any)?.preNodes?.map((preNodeId: string) => {
            const preNode = vvGlobal.app?.findOne((i) =>
              i.id === preNodeId ? 1 : 0,
            );

            if (preNode?.tag === "VvImage") {
              return (
                <Avatar
                  shape="square"
                  src={(preNode as VvImage).url}
                  imgAttr={{ style: { objectFit: "cover" } }}
                  size="default"
                  key={preNode?.id}
                />
              );
            }

            if (preNode?.tag === "VvText") {
              return (
                <Avatar shape="square" size="default" key={preNode?.id}>
                  {(preNode as VvText).text.slice(0, 6)}
                </Avatar>
              );
            }

            return null;
          })}
        </Space>
      </>
    ),
    [vvGlobal.activeNode],
  );

  const onContentChange = useCallback(
    (e: any[]) => {
      // TODO: 需要semi支持processing时候不清空内容
      if ((vvGlobal.activeNode as VvBase)?.generating) {
        return;
      }

      (vvGlobal.activeNode as any).set({
        aiProps: {
          ...((vvGlobal.activeNode as any)?.aiProps || {}),
          content: e?.[0]?.text,
        },
      });
    },
    [vvGlobal.activeNode],
  );

  const onConfigureChange = useCallback(() => {
    (e: any) => {
      (vvGlobal.activeNode as any).set({
        aiProps: {
          ...((vvGlobal.activeNode as any)?.aiProps || {}),
          imgProps: e.imgProps,
          model: e.model,
        },
      });
    };
  }, [vvGlobal.activeNode]);

  const onMessageSend = useCallback(
    (e: any) => {
      (vvGlobal.activeNode as VvImage).generateImage({
        imgProps: e.setup?.imgProps,
        model: e.setup?.model,
        content: e.inputContents?.[0]?.text,
      });
    },
    [vvGlobal.activeNode],
  );

  const generating = useMemo(() => {
    return !!(
      vvGlobal.activeNodeId &&
      vvGlobal.generatingNodeId.includes(vvGlobal.activeNodeId)
    );
  }, [vvGlobal.generatingNodeId, vvGlobal.activeNodeId]);

  return (
    <>
      {vvGlobal.activeNode ? (
        <div
          style={{
            zIndex: 1,
            position: "absolute",
            transform: `translate(calc(${!vvGlobal.aiChatBoxPosition?.visible ? -99999 : (vvGlobal.aiChatBoxPosition?.x ?? -99999)}px - 50%), ${!vvGlobal.aiChatBoxPosition?.visible ? -99999 : (vvGlobal.aiChatBoxPosition?.y ?? -99999) + 18}px)`,
          }}
          onKeyDown={(e) => {
            // 阻止冒泡
            e.stopPropagation();
          }}
        >
          <AIChatInput
            key={`ai-chat-input-${vvGlobal.activeNode.id}`}
            placeholder="输入内容..."
            style={{ backgroundColor: "var(--semi-color-bg-1)", width: 700 }}
            defaultContent={(vvGlobal?.activeNode as any)?.aiProps?.content}
            onContentChange={onContentChange}
            renderConfigureArea={renderConfigureArea}
            onConfigureChange={onConfigureChange}
            renderTopSlot={renderTopSlot}
            showUploadButton={false}
            skillHotKey="/"
            generating={generating}
            keepSkillAfterSend={true}
            onMessageSend={onMessageSend}
            skills={[
              {
                icon: <IconTemplateStroked />,
                value: "writing",
                label: "多机位九宫格",
              },
              {
                icon: <IconSearch />,
                value: "AI 编程",
                label: "AI coding",
              },
            ]}
          />
        </div>
      ) : null}
    </>
  );
});
