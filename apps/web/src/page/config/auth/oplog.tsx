import { SchemaTable } from "@/component/schema/table";
import { useRequest } from "ahooks";
import { api } from "../../../api/index";

export const OplogPage = () => {
  const { data: options } = useRequest(api.v1.role.options);

  return (
    <>
      <SchemaTable
        title="操作日志"
        request={api.v1.oplog.read}
        defaultSort={{
          createdAt: "desc",
        }}
        columns={[
          { dataIndex: "id", title: "ID" },
          {
            dataIndex: "tenantId",
            title: "商户ID",
            showInFilter: true,
          },

          {
            dataIndex: "scope",
            title: "操作通道",
            showInFilter: true,
            type: "select",
            props: {
              options: [],
            },
          },

          {
            dataIndex: "accountId",
            title: "操作人ID",
            showInFilter: true,
          },

          {
            dataIndex: "opName",
            title: "操作",
          },

          {
            dataIndex: "opKey",
            title: "操作",
            showInFilter: true,
            hiddenInTable: true,
            type: "tree-select",
            props: {
              treeData: options?.permission || [],
              expandAll: true,
              leafOnly: true,
              virtualize: {
                itemSize: 28,
                height: 336,
              },
            },
          },

          {
            dataIndex: "ip",
            title: "操作IP",
          },

          {
            dataIndex: "createdAt",
            title: "操作时间",
            type: "datetime",
            sorter: true,
            showInFilter: true,
            props: ({ scene }) => {
              return { type: scene === "table" ? "dateTime" : "dateTimeRange" };
            },
          },
          {
            type: "action",
            width: 30,
          },
        ]}
      />
    </>
  );
};
