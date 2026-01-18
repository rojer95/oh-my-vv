import styled from "styled-components";

export const ArrayFieldTable = styled.div<any>`
  .semi-table-row-cell {
    padding: 6px !important;
    > .semi-form-field {
      padding: 0;
    }
  }
  .semi-table-required {
    margin-left: 4px;
    color: var(--semi-color-danger);
    font-weight: 600;
  }

  .semi-table-helper {
    margin-left: 4px;
  }

  .semi-table-extra {
    margin-left: 4px;
  }
`;
