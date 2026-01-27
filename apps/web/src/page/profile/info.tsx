import { api } from "@/api";
import { adminModel } from "@/mobx/admin";
import {
  Button,
  Card,
  List,
  Modal,
  Toast,
  Tooltip,
  Typography,
} from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useRef, useState } from "react";
import { ChangeMailModal } from "./components/change-mail-modal";
import { ChangePasswordModal } from "./components/password";
import { TotpModal } from "../../component/totp-modal";

export const ProfileInfoPage = observer(() => {
  const [passwordModal, setPasswordModal] = useState(false);
  const [mailModal, setMailModal] = useState(false);

  const currentTotpSecret = useRef<string>(undefined);
  const profile = useMemo(() => {
    return adminModel.profile;
  }, [adminModel.profile]);

  const [totp, setTotp] = useState({
    visible: false,
    qrcode: "",
    mode: "bind",
  });
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <ChangePasswordModal
        visible={passwordModal}
        onCancel={() => {
          setPasswordModal(false);
        }}
      />

      <ChangeMailModal
        visible={mailModal}
        onCancel={() => {
          setMailModal(false);
        }}
        onSuccess={() => adminModel.loadProfile()}
        mode={profile?.mail ? "unbind" : "bind"}
        mail={profile?.mail}
      />

      <TotpModal
        visible={totp.visible && ["unbind", "bind-done"].includes(totp.mode)}
        onCancel={() => {
          setTotp({ visible: false, qrcode: "", mode: "bind" });
        }}
        onSuccess={async (code: string) => {
          if (totp.mode === "bind-done" && !currentTotpSecret.current) {
            Toast.warning("Totp数据缺失");
            return;
          }

          await api.api.v1.auth.totp.put({
            totpSecret: currentTotpSecret.current,
            code,
          });

          Toast.success(totp.mode === "unbind" ? "解绑成功" : "绑定成功");
          setTotp({ visible: false, qrcode: "", mode: "bind" });
          adminModel.loadProfile();
        }}
      />

      <Modal
        hasCancel={false}
        okText="我已扫码绑定，进行验证"
        visible={totp.visible && totp.mode === "bind"}
        title="扫码绑定"
        keepDOM={false}
        closeOnEsc={false}
        maskClosable={false}
        onOk={() => {
          setTotp({ visible: true, qrcode: "", mode: "bind-done" });
          adminModel.loadProfile();
        }}
      >
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ marginBottom: 20, color: "red" }}>
            <Typography.Text style={{ color: "red", fontWeight: "bold" }}>
              请使用
              <br />
              <Tooltip content="各大软件商店均可下载该APP，支持安卓、IOS系统">
                微软 Authenticator 或 Google身份验证器APP
              </Tooltip>
              <br />
              扫码绑定。
            </Typography.Text>
            <br />
          </div>

          <div>
            <QRCodeSVG size={200} value={totp.qrcode} />
          </div>
        </div>
      </Modal>

      <Card title="账户设置" style={{ width: 600 }}>
        <List>
          <List.Item
            main="密码"
            extra={
              <Button
                onClick={() => {
                  setPasswordModal(true);
                }}
                theme="borderless"
              >
                修改
              </Button>
            }
          />
          <List.Item
            header={`邮箱`}
            main={`${profile?.mail || ""}`}
            extra={
              <Button
                onClick={() => {
                  setMailModal(true);
                }}
                theme="borderless"
                type={profile?.mail ? "danger" : "primary"}
              >
                {profile?.mail ? "解绑" : "绑定"}
              </Button>
            }
          />

          <List.Item
            main={`多重认证`}
            extra={
              <Button
                onClick={async () => {
                  if (!profile?.totp) {
                    const { otpauth_url, base32 } =
                      await api.api.v1.auth.totp.post();
                    currentTotpSecret.current = base32;
                    setTotp({
                      visible: true,
                      qrcode: otpauth_url,
                      mode: "bind",
                    });
                  } else {
                    setTotp({ visible: true, qrcode: "", mode: "unbind" });
                  }
                }}
                theme="borderless"
                type={profile?.totp ? "danger" : "primary"}
              >
                {profile?.totp ? "解绑" : "绑定"}
              </Button>
            }
          />
        </List>
      </Card>
    </div>
  );
});
