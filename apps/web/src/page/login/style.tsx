import styled from "styled-components";

export const LoginPageStyled = styled.div`
  width: 100%;
  height: 100vh;
  background: rgb(var(--semi-grey-0));
  flex-direction: column;
  align-items: center;
  display: flex;
  justify-content: center;

  .login-form {
    align-items: center;
    background: var(--semi-color-bg-0);
    border-radius: 8px;
    box-shadow:
      0px 4px 14px 0px #0000001a,
      0px 0px 1px 0px #0000004d;
    display: flex;
    flex-direction: column;
    padding: 48px 56px;
    row-gap: 30px;
    width: 440px;
    flex-shrink: 0;
    position: relative;

    .channel-tag {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 12px;
      padding: 4px 6px;
      border-radius: 0px 8px 0px 8px;
      background-color: var(--semi-color-primary);
      color: rgba(var(--semi-white), 1);
    }

    .logo {
      height: 72px;
      width: 72px;
      flex-shrink: 0;
      object-fit: contain;
      object-position: center;
    }

    .header {
      text-align: center;
    }

    .title {
      color: var(--semi-color-text-2);
      font-size: 16px;
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .semi-form {
      width: 100%;

      .forgot {
        margin-bottom: 16px;
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  .copyright {
    text-align: center;
    color: var(--semi-color-text-2);
    margin-top: 24px;
  }

  @media screen and (max-width: 750px) {
    padding: 24px;
    box-sizing: border-box;

    .login-form {
      width: 100%;
      box-sizing: border-box;
      padding: 24px;
    }
  }
`;
