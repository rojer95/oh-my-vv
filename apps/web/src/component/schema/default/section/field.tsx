import { SchemaFields } from "../../fields";
import { SectionStyle } from "../../style";

export const SectionField = (props: any) => {
  const label = props.label as any;

  return (
    <SectionStyle style={props.style}>
      {label?.text || label?.extra ? (
        <div className="section-title-box">
          <div className="section-title">{label?.text}</div>
          {label?.extra ? (
            <div className="section-extra">{label?.extra}</div>
          ) : null}
        </div>
      ) : null}

      {!Array.isArray(props.columns) || !props.columns?.length ? null : (
        <div className="section-content">
          <SchemaFields columns={props.columns} />
        </div>
      )}
    </SectionStyle>
  );
};
