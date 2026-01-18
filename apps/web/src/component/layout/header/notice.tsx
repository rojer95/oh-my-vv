import { api } from "@/api";
import { noticeModel } from "@/mobx/notice";
import { IconBell, IconRefresh } from "@douyinfe/semi-icons";
import {
  Badge,
  Button,
  Card,
  List,
  Modal,
  Popover,
  Typography,
} from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

const Empty = styled.div<any>`
  text-align: center;
  font-size: 14px;
  color: var(--semi-color-text-2);
`;
export const Notice = observer(() => {
  const onRead = async (id: number) => {
    await api.api.v1.notice.readed.post({ id });
    noticeModel.loadNotices();
  };

  const onPreview = (item: any) => {
    if (item.content) {
      Modal.info({
        title: item.title,
        content: (
          <div
            style={{
              whiteSpace: "pre-line",
            }}
          >
            {item.content}
          </div>
        ),
        okText: "已读",
        onOk: async () => {
          if (!item.id) return;
          onRead(item.id);
        },
      });
    }
  };

  return (
    <Popover
      position="bottomRight"
      content={
        <Card
          style={{ width: 400 }}
          headerExtraContent={
            <Button
              onClick={() => {
                noticeModel.loadNotices();
              }}
              icon={<IconRefresh />}
            />
          }
          title="通知"
        >
          {noticeModel.notices?.length === 0 ? (
            <Empty>暂无通知</Empty>
          ) : (
            <List
              dataSource={noticeModel.notices}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Button
                      onClick={async () => {
                        if (!item.id) return;
                        onRead(item.id);
                      }}
                    >
                      已读
                    </Button>
                  }
                >
                  <Typography.Text
                    ellipsis={{ showTooltip: true }}
                    style={{ width: 218, cursor: "pointer" }}
                    onClick={() => {
                      onPreview(item);
                    }}
                  >
                    {item.title}
                  </Typography.Text>
                </List.Item>
              )}
            />
          )}
        </Card>
      }
    >
      <Badge dot={noticeModel.notices.length > 0} type="danger">
        <Button theme="borderless" icon={<IconBell size="large" />} />
      </Badge>
    </Popover>
  );
});
