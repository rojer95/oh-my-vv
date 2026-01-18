import styled from "styled-components";

export const Rect = styled.div`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: 6px solid var(--semi-color-border);
  box-sizing: border-box;
  position: relative;

  &::before {
    content: "";
    background-color: ${(props) => props.color};
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    z-index: 1;
  }

  &::after {
    content: "";
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADFJREFUOE9jZGBgEGHAD97gk2YcNYBhmIQBgWSAP52AwoAQwJvQRg1gACckQoC2gQgAIF8IscwEtKYAAAAASUVORK5CYII=)
      left center;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    z-index: 0;
  }
`;

export const PickerBox = styled.div`
  .sketch-picker {
    box-shadow: none !important;
  }
  .btns {
    display: flex;
    width: 100%;
  }
`;
