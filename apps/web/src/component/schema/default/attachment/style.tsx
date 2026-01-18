import styled from "styled-components";

export const UploadBox = styled.div<any>`
  &.picture {
    .small {
      height: 38px !important;
      width: 38px !important;

      .actions {
        .semi-icon-eye_opened {
          display: none;
        }
      }
    }

    .file-item {
      display: inline-block;
      height: 96px;
      width: 96px;
      margin: 0 8px 8px 0;
      vertical-align: top;
      /* padding: 8px; */
      border: 1px solid var(--semi-color-border);
      border-radius: 2px;
      transform-origin: left center;

      .content {
        position: relative;
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background-color: var(--semi-color-fill-0);
        }

        .actions {
          position: absolute;
          top: 0px;
          left: 0px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          opacity: 0;
          transition: all 0.3s;

          .action {
            margin: 0px 6px;
            color: rgba(255, 255, 255, 0.8);
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              color: rgba(255, 255, 255, 1);
            }
          }
        }

        &:hover {
          .actions {
            opacity: 1;
          }
        }
      }

      &.upbtn {
        background-color: var(--semi-color-fill-0);
        border: 2px dashed var(--semi-color-border);
        > div {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
      }
    }
  }
`;
