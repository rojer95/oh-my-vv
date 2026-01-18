import styled from "styled-components";

export const SectionStyle = styled.div<any>`
  .section-title-box {
    margin: 12px 0px 18px 0px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-left: 2px solid var(--semi-color-primary);
    padding-left: 12px;
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    line-height: 1;
  }

  .section-extra {
    line-height: 1;
  }

  .section-content {
    padding-left: 18px;
  }
`;

export const TagGroupStyle = styled.div<any>`
  margin-bottom: -8px;
  .semi-tag {
    margin-bottom: 8px;
  }
`;
