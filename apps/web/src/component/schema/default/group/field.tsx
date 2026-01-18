import { Col, Row } from "@douyinfe/semi-ui";
import React, { CSSProperties } from "react";

import { RowProps } from "@douyinfe/semi-ui/lib/es/grid";
import { SchemaFields } from "../../fields";
import { SectionStyle } from "../../style";
import { SchemaColumn } from "../../typing";

export type GroupProps = {
  label?: { text: React.ReactNode };
  gutter?: RowProps["gutter"];
  align?: RowProps["align"];
  justify?: RowProps["justify"];
  noLabel?: boolean;
  field?: string;
  extra?: any;
  columns?: Array<SchemaColumn>;
  style?: CSSProperties;
  extraText?: React.ReactNode;
};

export const GroupFiled = (props: GroupProps) => {
  const {
    label,
    gutter = 8,
    justify,
    style,
    noLabel = false,
    extraText,
    columns = [],
    ...colProps
  } = props;

  const Fields = (
    <Row gutter={gutter} justify={justify} type="flex">
      <SchemaFields
        columns={columns}
        getWrapContainer={(dom) => {
          return <Col {...colProps}>{dom}</Col>;
        }}
      />
    </Row>
  );

  return (
    <SectionStyle style={style}>
      {!noLabel && (label?.text || extraText) ? (
        <div className="section-title-box">
          <div className="section-title">{label?.text}</div>
          {extraText ? <div className="section-extra">{extraText}</div> : null}
        </div>
      ) : null}

      {Fields}
    </SectionStyle>
  );
};
