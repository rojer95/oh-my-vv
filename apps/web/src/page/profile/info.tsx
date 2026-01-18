import { TotpModal } from "@/component/totp-modal";
import {
  Button,
  Card,
  List,
  Modal,
  Toast,
  Tooltip,
  Typography,
} from "@douyinfe/semi-ui";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import { ChangePasswordModal } from "./password";

import { adminModel } from "@/mobx/admin";
import { observer } from "mobx-react-lite";
import { api } from "../../api";
import { ChangeMailModal } from "../../component/change-mail-modal";

export const ProfileInfoPage = observer(() => {
  const [passwordModal, setPasswordModal] = useState(false);
  const [mailModal, setMailModal] = useState(false);

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
        visible={totp.visible && totp.mode === "unbind"}
        onCancel={() => {
          setTotp({ visible: false, qrcode: "", mode: "bind" });
        }}
        onSuccess={async (code: string) => {
          await api.v1.auth.unBindTotp(code);
          setTotp({ visible: false, qrcode: "", mode: "bind" });
          adminModel.loadProfile();
          Toast.success("解绑成功");
        }}
      />

      <Modal
        hasCancel={false}
        okText="我已扫码绑定，确认关闭"
        visible={totp.visible && totp.mode === "bind"}
        title="扫码绑定（请扫码成功后再关闭）"
        keepDOM={false}
        closeOnEsc={false}
        maskClosable={false}
        onOk={() => {
          setTotp({ visible: false, qrcode: "", mode: "bind" });
          adminModel.loadProfile();
        }}
      >
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ marginBottom: 20, color: "red" }}>
            <Typography.Text style={{ color: "red", fontWeight: "bold" }}>
              请立即使用
              <br />
              <Tooltip content="各大软件商店均可下载该APP，支持安卓、IOS系统">
                微软 Authenticator 或 Google身份验证器APP
              </Tooltip>
              <br />
              扫码绑定，以免出现无法登录的情况。
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
                onClick={() => {
                  if (!profile?.totp) {
                    Modal.confirm({
                      title: "操作提示",
                      content:
                        "生成二维码后，请务必先用“微软 Authenticator 或 Google身份验证器APP”扫码绑定，确认成功后再关闭二维码窗口！",
                      onOk: async () => {
                        const qrcode = await api.v1.auth.bindTotp();
                        setTotp({ visible: true, qrcode, mode: "bind" });
                      },
                      okText: "我明白，扫码成功后才能关闭窗口",
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
