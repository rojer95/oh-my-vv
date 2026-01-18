import { withField } from "@douyinfe/semi-ui";
import DSlate, { DSlateRef } from "@dslate/semi";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Descendant, Element } from "slate";
import { Editor, Node } from "slate";

const value2slate = (value: any): Descendant[] => {
  if (!Node.isNodeList(value)) {
    return [
      {
        type: "paragraph",
        children: [{ text: "" }],
      } as Element,
    ];
  }
  return value as Descendant[];
};

const slate2value = (editor?: any, slate?: any) => {
  if (!slate || !Array.isArray(slate) || !editor) return undefined;
  if (
    slate.every(
      (i) =>
        Node.string(i) === "" &&
        !i?.children?.some((n: Element) => Editor.isInline(editor, n))
    )
  )
    return undefined;
  return slate;
};

export const DSlateSemi = ({
  value,
  onChange,
  mobile,
  style,
  ...props
}: any) => {
  const [rid, setRid] = useState(1);
  const preValue = useRef(value);
  const ref = useRef<DSlateRef>(null);

  const slateValue = useMemo(() => {
    return value2slate(value?.json);
  }, [value]);

  useEffect(() => {
    if (preValue.current !== value) {
      preValue.current = value;
      setRid((r) => r + 1);
    }
  }, [value]);

  return (
    <div style={style}>
      <DSlate
        {...props}
        key={`k_${rid}`}
        ref={ref}
        className={mobile ? "dslate__mobile" : undefined}
        value={slateValue}
        onChange={(v: any) => {
          const editor = ref.current?.getEditor();
          const json = slate2value(editor, v);
          const changeValue = json
            ? {
                json,
                html: ref.current?.serialize({ children: v }),
              }
            : undefined;
          preValue.current = changeValue;
          onChange(changeValue);
        }}
      />
    </div>
  );
};

export const DSlateSemiField = withField(DSlateSemi);
