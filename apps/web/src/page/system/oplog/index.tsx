import { api } from "@/api";
import { SchemaTable } from "@/component/schema/table";

export const OplogPage = () => {
  return (
    <>
      <SchemaTable
        title="操作日志"
        request={api.api.v1["system-operation-log"].read.post}
        defaultSort={{
          createdAt: "desc",
        }}
        columns={[
          { dataIndex: "id", title: "ID" },

          {
            dataIndex: "operatorAccount",
            title: "操作人账号",
            showInFilter: true,
            width: 100,
          },

          {
            dataIndex: "permissionName",
            title: "操作",
          },

          {
            dataIndex: "success",
            title: "成功与否",
            type: "switch",
          },

          {
            dataIndex: "errorMessage",
            title: "错误信息",
          },

          // {
          //   dataIndex: "opKey",
          //   title: "操作",
          //   showInFilter: true,
          //   hiddenInTable: true,
          //   type: "tree-select",
          //   props: {
          //     treeData: options?.permission || [],
          //     expandAll: true,
          //     leafOnly: true,
          //     virtualize: {
          //       itemSize: 28,
          //       height: 336,
          //     },
          //   },
          // },

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
