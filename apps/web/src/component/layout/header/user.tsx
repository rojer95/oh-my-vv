import { IconQuit, IconUser } from "@douyinfe/semi-icons";
import { Avatar, Dropdown } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { adminModel } from "@/mobx/admin";

export const User = observer(() => {
  const navigate = useNavigate();

  return (
    <Dropdown
      position="bottomLeft"
      render={
        <Dropdown.Menu>
          <Dropdown.Item
            icon={<IconUser />}
            onClick={() => {
              navigate("/profile");
            }}
          >
            账户设置
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            icon={<IconQuit />}
            onClick={() => {
              adminModel.logout();
            }}
          >
            退出登录
          </Dropdown.Item>
        </Dropdown.Menu>
      }
    >
      <Avatar color="orange" size="small">
        {String(adminModel.profile?.realName || "").slice(0, 2)}
      </Avatar>
    </Dropdown>
  );
});
