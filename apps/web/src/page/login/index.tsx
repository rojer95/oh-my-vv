import { useRef, useState } from "react";

import {
  Button,
  Checkbox,
  Form,
  Spin,
  Toast,
  Typography,
} from "@douyinfe/semi-ui";

import { CheckboxEvent } from "@douyinfe/semi-ui/lib/es/checkbox";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";

import fshopLogo from "@/asset/fshop.svg";
import { TimerButton } from "@/component/timer-button";
import { TotpModal } from "@/component/totp-modal";
import { adminModel } from "@/mobx/admin";
import { STORAGE_AUTH_KEY } from "@rojer/mf-common";
import { useRequest } from "ahooks";
import { useNavigate } from "react-router-dom";
import { LoginPageStyled } from "./style";
import { api, apiProxy } from "@/api";

export const LoginPage = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "forget">("login");

  const formApi = useRef<FormApi>(undefined);
  const [error, setError] = useState("");

  const {
    data: { status: needCaptcha } = { status: false },
    runAsync: checkCaptchaStatus,
  } = useRequest(apiProxy(api.api.v1.auth.captcha.get), {
    onSuccess: ({ status }) => {
      if (status) {
        refreshCaptcha();
      }
    },
  });

  const {
    data: captcha,
    refresh: refreshCaptcha,
    loading: captchaLoading,
  } = useRequest<any, []>(apiProxy(api.api.v1.auth.captcha.post), {
    manual: true,
    onBefore: () => {
      formApi.current?.setValue("code", "");
    },
  });

  const [remember, setRemember] = useState(true);

  const { runAsync: loginRun, loading: loginLoading } = useRequest(
    apiProxy(api.api.v1.auth.login.post),
    {
      manual: true,
      onSuccess: (response: any) => {
        sessionStorage.removeItem(STORAGE_AUTH_KEY);
        localStorage.removeItem(STORAGE_AUTH_KEY);
        if (remember) {
          localStorage[STORAGE_AUTH_KEY] = response.token;
        } else {
          sessionStorage[STORAGE_AUTH_KEY] = response.token;
        }
        adminModel.loadProfile();
        setError("");
        navigate(`/dashboard`);
      },
      onError: (err) => {
        checkCaptchaStatus();
        setError(err.message);
      },
    },
  );

  const { runAsync: forgetResetPassword, loading: resetLoading } = useRequest(
    apiProxy(api.api.v1.auth.forget.password.post),
    {
      manual: true,
      onSuccess: () => {
        isCodeSend.current = false;
        Toast.success("密码重置成功");
        formApi.current?.setValues({});
        setMode("login");
      },
    },
  );

  const isCodeSend = useRef<boolean>(false);

  const { loading: mailLoading, runAsync: forgetSendCode } = useRequest(
    apiProxy(api.api.v1.auth.forget.code.post),
    {
      manual: true,
      onSuccess: () => {
        isCodeSend.current = true;
        Toast.success("验证码发送成功");
      },
    },
  );

  const totpNext = useRef<any>(null);

  const [totpVisible, setTotpVisible] = useState(false);
  const waitTotpToken = () =>
    new Promise<string>((resolve, reject) => {
      totpNext.current = { resolve, reject };
      setTotpVisible(true);
    });

  const onLogin = async (value: any) => {
    const {
      data: { status },
      error,
    } = await api.api.v1.auth.totp.get({
      query: { account: value.account },
    });

    if (error) throw error;

    if (status) {
      const totpToken = await waitTotpToken();
      value.totpToken = totpToken;
    }

    await loginRun({
      id: needCaptcha ? captcha.id : undefined,
      ...value,
    });
  };

  const onSubmit = async (value: any) => {
    if (mode === "login") {
      await onLogin(value);
    }

    if (mode === "forget") {
      if (!isCodeSend.current) {
        Toast.warning("请发送验证码");
        return;
      }

      forgetResetPassword(value);
    }
  };

  return (
    <LoginPageStyled as="div">
      <TotpModal
        visible={totpVisible}
        onCancel={() => {
          setTotpVisible(false);
          totpNext.current?.reject?.();
          totpNext.current = undefined;
        }}
        onSuccess={(token: string) => {
          if (token) {
            setTotpVisible(false);
            totpNext.current?.resolve?.(token);
            totpNext.current = undefined;
          }
        }}
      />

      <div className="login-form">
        <div className="channel-tag">平台端</div>
        <img className="logo" src={import.meta.env.VITE_LOGO || fshopLogo} />
        <div className="header">
          <Typography.Title heading={1}>
            {mode === "login" ? `欢迎回来` : `找回密码`}
          </Typography.Title>
          <div className="title">
            {mode === "login"
              ? `登录 ${import.meta.env.VITE_TITLE} 账户`
              : `找回您的 ${import.meta.env.VITE_TITLE} 密码`}
          </div>
        </div>
        <Form
          getFormApi={(e: FormApi) => (formApi.current = e)}
          onSubmit={onSubmit}
        >
          <Form.Input
            field="account"
            placeholder="登录账号"
            size="large"
            rules={[{ required: true, message: "请输入账号" }]}
            addonAfter={
              mode === "login" ? null : (
                <TimerButton
                  loading={mailLoading}
                  onClick={async () => {
                    const account = formApi.current?.getValue("account");
                    if (account) {
                      await forgetSendCode({ account });
                      formApi.current?.setValue("code", undefined);
                      return true;
                    }
                    return false;
                  }}
                  size="small"
                >
                  发送验证码
                </TimerButton>
              )
            }
            noLabel
          />

          {mode === "forget" ? (
            <Form.Input
              field="code"
              placeholder="验证码"
              size="large"
              rules={[{ required: true, message: "请输入验证码" }]}
              noLabel
            />
          ) : null}

          <Form.Input
            field="password"
            placeholder={mode === "login" ? "登录密码" : "新密码"}
            mode={mode === "login" ? "password" : undefined}
            size="large"
            rules={[{ required: true, message: "请输入密码" }]}
            noLabel
          />

          {needCaptcha && mode === "login" ? (
            <Form.Input
              field="code"
              placeholder="验证码"
              size="large"
              rules={[{ required: true, message: "请输入验证码" }]}
              addonAfter={
                <Spin spinning={captchaLoading}>
                  <img
                    onClick={refreshCaptcha}
                    style={{ cursor: "pointer", display: "block" }}
                    src={captcha?.imageBase64}
                  />
                </Spin>
              }
              noLabel
            />
          ) : null}

          {mode === "login" ? (
            <div className="forgot">
              <Checkbox
                checked={remember}
                onChange={(e: CheckboxEvent) => setRemember(!!e.target.checked)}
              >
                记住密码
              </Checkbox>

              <Typography.Text
                onClick={() => {
                  formApi.current?.setValues({});
                  setMode(mode === "login" ? "forget" : "login");
                }}
                link
              >
                忘记密码?
              </Typography.Text>
            </div>
          ) : (
            <br />
          )}

          <Form.ErrorMessage error={error} />
          <br />

          <Button
            theme="solid"
            type="primary"
            size="large"
            htmlType="submit"
            loading={loginLoading || resetLoading}
            block
          >
            {mode === "login" ? "登 录" : "重置密码"}
          </Button>

          {mode === "login" ? null : (
            <div style={{ textAlign: "center" }}>
              <br />
              <Typography.Text
                onClick={() => {
                  formApi.current?.reset();
                  setMode("login");
                }}
                link
              >
                返回登录
              </Typography.Text>
            </div>
          )}
        </Form>
      </div>

      <div className="copyright">{import.meta.env.VITE_COPYRIGHT}</div>
    </LoginPageStyled>
  );
};
