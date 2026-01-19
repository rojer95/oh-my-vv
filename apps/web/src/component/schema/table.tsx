import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Divider,
  Dropdown,
  Form,
  Modal,
  Popover,
  Radio,
  Table as SemiTable,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from "@douyinfe/semi-ui";
import { usePagination } from "ahooks";
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { IconHelpCircle, IconRefresh, IconSetting } from "@douyinfe/semi-icons";
import { BaseFormProps, FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { PaginationProps } from "@douyinfe/semi-ui/lib/es/pagination";
import { PopconfirmProps } from "@douyinfe/semi-ui/lib/es/popconfirm";
import {
  ColumnProps,
  RenderOptions,
  Size,
  TableProps,
} from "@douyinfe/semi-ui/lib/es/table";
import { omit, sortBy } from "lodash-es";
import { observer } from "mobx-react-lite";
import { usePermissions } from "../../hook/permission.hook";
import { Access } from "../auth/access";
import { SchemaContext } from "./context/schema-content";
import { SchemaFilter } from "./filter";
import { SchemaFormProps } from "./form";
import { useGlobalSchema } from "./hook/use-global-schema";
import { SchemaTableColumn } from "./render/schema-table-colunm";
import { A, TableRowAction } from "./table-row-action";
import { FilterItem, SchemaColumn, TableRowActionProps } from "./typing";
import { filterUtils } from "./util";
import { getPagerData } from "./util/tableUtil";

type TableSort = {
  [key: string]: "asc" | "desc" | undefined;
};

const defaultPaginationProps = {
  showSizeChanger: true,
} as PaginationProps;

export type SchemaTableInstance = {
  refresh?: () => void;
  getFilterData?: () => any;
  getDataSource?: () => any[] | undefined;
  search?: (v: FilterItem[]) => void;
  submitSearch?: () => void;
};

export type SchemaTableProps = {
  title?: React.ReactNode;
  columns: SchemaColumn[];
  tableRef?: React.Ref<SchemaTableInstance | undefined | null>;
  renderActionBar?: () => React.ReactNode;
  renderTableHeader?: () => React.ReactNode;
  request?: (data: any) => Promise<any>;
  filterInitValues?:
    | BaseFormProps["initValues"]
    | (() => BaseFormProps["initValues"]);
  filterProps?: Partial<SchemaFormProps>;
  createAccess?: string;
  onCreate?: () => void;
  createButtonText?: React.ReactNode;

  updateAccess?: string;
  onUpdate?: (value: any) => Promise<void> | void;
  updateButtonText?: React.ReactNode;
  updateProps?: any;

  deleteAccess?: string;
  deleteButtonText?: React.ReactNode;
  deletePopconfirmProps?:
    | Omit<PopconfirmProps, "onConfirm" | "onCancel">
    | false;
  onDelete?: (value: any) => Promise<void> | void;
  deleteProps?: any;

  onRefresh?: () => any;
  onLoad?: (data: any) => void;

  defaultSort?: TableSort;
  valueTransform?: (v: any) => any;
  beforeFilter?: (value: any) => any;
  defaultColWidth?: number;
  refreshDeps?: Array<any>;
  scroll?: TableProps["scroll"] | false;
  tab?: {
    defaultValue: any;
    dataIndex: string;
    tabList: Array<{ tab: React.ReactNode; itemKey: string; value: any }>;
    operator?: FilterItem["op"];
  };
  defaultPageSize?: number;

  hideActionBar?: boolean;
  hideFilterBar?: boolean;

  containerType?: "none" | "card";
  onSearch?: (where: FilterItem[]) => void;
} & Omit<TableProps, "columns">;

const SORT_DIRECTIONS_MAP: TableSort = {
  descend: "desc",
  ascend: "asc",
};

const SORT_DIRECTIONS_MAP_RE: Record<string, string> = {
  desc: "descend",
  asc: "ascend",
};

export const SchemaTable = observer(
  ({
    columns,
    tableRef,
    pagination,
    dataSource,
    request,
    renderActionBar,
    renderTableHeader,
    onCreate,
    onDelete,
    onUpdate,
    createAccess,
    deleteAccess,
    updateAccess,
    refreshDeps = [],
    title,
    createButtonText = "创建",
    updateButtonText = "编辑",
    deleteButtonText = "删除",
    deletePopconfirmProps = {
      title: "操作确认",
      content: "是否确认要删除该条数据？",
      okType: "danger",
      okText: "确认删除",
    },
    updateProps = {},
    deleteProps = {},
    onRefresh,
    onLoad,
    rowKey = "id",
    scroll,
    defaultSort,
    valueTransform = (v) => v,
    beforeFilter = (v) => v,
    defaultColWidth = 120,
    filterInitValues,
    filterProps = {},
    tab,
    defaultPageSize = 10,
    hideActionBar = false,
    hideFilterBar = false,
    containerType = "card",
    onSearch,
    ...tableProps
  }: SchemaTableProps) => {
    const { permissions } = usePermissions();
    const [filters, setFilters] = useState<any[]>([]);

    const columnsOptions: Array<{ label: string; value: string }> =
      useMemo(() => {
        return (
          columns
            ?.filter(
              (i) => i.type !== "action" && !i.hiddenInTable && !!i.dataIndex,
            )
            ?.map((i) => ({
              label: i.title as string,
              value: i.dataIndex as string,
            })) ?? []
        );
      }, [columns]);

    const [tableInnerProps, setTableInnerProps] = useState<{
      size: Size;
      cols: {
        all: {
          indeterminate: boolean;
          checked: boolean;
        };
        value: string[];
      };
    }>({
      size: localStorage["TABLE_SIZE"] || "default",
      cols: {
        all: {
          indeterminate: false,
          checked: true,
        },
        value: columnsOptions.map((i) => i.value),
      },
    });

    const schemas = useGlobalSchema();

    const [currentTabValue, setCurrentTabValue] = useState(tab?.defaultValue);

    useEffect(() => {
      setFilters(
        columns
          .filter((i) => i.showInFilter)
          .map((i) => ({ ...i, required: false })),
      );
    }, [columns]);

    const [where, setWhere] = useState<FilterItem[] | undefined>(undefined);
    const [sorter, setSorter] = useState<TableSort | undefined>(defaultSort);

    const filterRef = useRef<FormApi>(undefined);

    const realFilterInitValues: BaseFormProps["initValues"] = useMemo(() => {
      if (!filterInitValues) return undefined;
      if (typeof filterInitValues === "function") return filterInitValues();
      return filterInitValues;
    }, []);

    const getMixWhere = () => {
      const postWhere = [...(where || [])];
      if (tab?.dataIndex) {
        postWhere.push({
          key: tab.dataIndex,
          op: tab.operator || "=",
          value: tab.tabList.find((i) => i.itemKey === currentTabValue)?.value,
        });
      }

      return postWhere;
    };

    const {
      data,
      loading,
      refresh,
      pagination: paginationHook,
    } = usePagination(
      async (paginationQuery) => {
        const mixWhere = getMixWhere();
        const res = await request?.({
          page: paginationQuery?.current,
          pageSize: paginationQuery?.pageSize,
          where: mixWhere,
          order: sorter,
        });

        onLoad?.(res);

        return getPagerData(res);
      },
      {
        defaultPageSize: defaultPageSize,
        refreshDeps: [where, sorter, currentTabValue, ...refreshDeps],
        ready: !!request,
      },
    );

    useEffect(() => {
      if (request || !where) return;
      const mixWhere = getMixWhere();
      onSearch?.(mixWhere);
    }, [where, request]);

    const tableData = useMemo(() => {
      if (request) {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data?.list)) return data.list;
        return [];
      }

      return dataSource;
    }, [request, dataSource, data]);

    useImperativeHandle(
      tableRef,
      () => ({
        refresh: () => (request ? refresh() : onRefresh?.()),
        getFilterData: () => {
          const value = filterRef.current?.getValues();
          return filterUtils.value2Filter(value, filters, schemas);
        },
        getDataSource: () => tableData?.map(valueTransform),
        search: (v) => {
          setWhere(v);
          setTimeout(() => {
            filterRef.current?.setValues(v);
          }, 0);
        },
        submitSearch: () => {
          filterRef.current?.submitForm?.();
        },
      }),
      [tableData, filters, schemas],
    );

    const ActionBar = useMemo(() => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          {/* 左侧标题 */}
          <Space>
            {title ? (
              <Typography.Title heading={4}>{title}</Typography.Title>
            ) : null}
            <div>{renderTableHeader?.()}</div>
          </Space>

          {/* 右侧操作栏 */}
          <Space>
            {renderActionBar?.()}

            {onCreate ? (
              <Access permission={createAccess}>
                <Button theme="solid" onClick={onCreate}>
                  {createButtonText}
                </Button>
              </Access>
            ) : null}

            {request || onRefresh ? (
              <Tooltip content="刷新列表">
                <Button
                  theme="borderless"
                  icon={<IconRefresh />}
                  onClick={() => (request ? refresh() : onRefresh?.())}
                />
              </Tooltip>
            ) : null}

            <Popover
              position="bottomRight"
              trigger="click"
              showArrow
              content={
                <Space vertical align="start">
                  <Form.Slot labelPosition="left" label="尺寸">
                    <Radio.Group
                      type="button"
                      value={tableInnerProps.size}
                      onChange={(e) => {
                        localStorage["TABLE_SIZE"] = e.target.value;
                        setTableInnerProps((pre) => ({
                          ...pre,
                          size: e.target.value,
                        }));
                      }}
                      options={[
                        { label: "默认", value: "default" },
                        { label: "中等", value: "middle" },
                        { label: "紧凑", value: "small" },
                      ]}
                    ></Radio.Group>
                  </Form.Slot>

                  <Divider />

                  <Form.Slot
                    style={{
                      width: "100%",
                    }}
                    label={
                      <Checkbox
                        indeterminate={tableInnerProps.cols.all.indeterminate}
                        checked={tableInnerProps.cols.all.checked}
                        onChange={(e) => {
                          const _isCheckAll = !!e.target.checked;
                          setTableInnerProps((pre) => {
                            return {
                              ...pre,
                              cols: {
                                all: {
                                  checked: _isCheckAll,
                                  indeterminate: false,
                                },
                                value: _isCheckAll
                                  ? columnsOptions?.map((i) => i.value)
                                  : [],
                              },
                            };
                          });
                        }}
                      >
                        展示列
                      </Checkbox>
                    }
                  >
                    <CheckboxGroup
                      style={{
                        marginTop: 6,
                        marginLeft: 24,
                        maxHeight: 300,
                        overflowY: "auto",
                      }}
                      options={columnsOptions}
                      value={tableInnerProps.cols.value}
                      onChange={(_cols) => {
                        const isAll = _cols.length === columnsOptions.length;
                        const isNone = _cols.length === 0;
                        setTableInnerProps((pre) => {
                          return {
                            ...pre,
                            cols: {
                              all: {
                                checked: isAll,
                                indeterminate: !isAll && !isNone,
                              },
                              value: _cols,
                            },
                          };
                        });
                      }}
                    />
                  </Form.Slot>
                </Space>
              }
            >
              <span style={{ display: "inline-block" }}>
                <Tooltip content="表格配置">
                  <Button theme="borderless" icon={<IconSetting />} />
                </Tooltip>
              </span>
            </Popover>
          </Space>
        </div>
      );
    }, [
      onCreate,
      createAccess,
      renderActionBar,
      columnsOptions,
      tableInnerProps,
    ]);

    const tableColumns = useMemo(() => {
      const cols: ColumnProps<any>[] = [
        ...columns
          .filter((i) => i.type !== "action" && !i.hiddenInTable)
          .filter((i) =>
            tableInnerProps.cols.value.includes(i.dataIndex as string),
          )
          .map((column) => {
            const {
              width = defaultColWidth,
              title,
              helper,
              extra,
              ...restColums
            } = column;
            let defaultSortOrder: any = undefined;
            if (
              column.dataIndex &&
              defaultSort &&
              defaultSort[column.dataIndex]
            ) {
              defaultSortOrder =
                SORT_DIRECTIONS_MAP_RE[
                  (defaultSort[column.dataIndex] ?? "").toLocaleLowerCase()
                ] ?? undefined;
            }

            const realTitle = [
              <React.Fragment key="real-title">
                {typeof title === "function"
                  ? title({
                      values: {},
                      scene: "table",
                      field: column.dataIndex || "",
                    })
                  : title}
              </React.Fragment>,
            ];

            if (helper) {
              realTitle.push(
                <Tooltip key="helper" content={helper}>
                  <IconHelpCircle style={{ color: "--semi-color-text-1" }} />
                </Tooltip>,
              );
            }

            if (extra) {
              realTitle.push(<div key="extra">{extra}</div>);
            }

            return {
              ...restColums,
              title: <Space>{realTitle}</Space>,
              width,
              defaultSortOrder,
              render: (
                text: any,
                record: any,
                index: number,
                options?: RenderOptions,
              ) => (
                <SchemaTableColumn
                  value={text}
                  record={record}
                  index={index}
                  options={options}
                  column={column}
                />
              ),
            };
          }),
      ];

      const rowAction: any = columns.find((i) => i.type === "action");
      if (!rowAction) return cols;
      const {
        title = "操作",
        fixed = "right",
        width,
        ...restActionColums
      } = rowAction;
      cols.push({
        ...restActionColums,
        title,
        width,
        fixed,
        render: (_text, record, index) => {
          const {
            props = {
              wrap: true,
              style: {
                justifyContent: "space-around",
              },
            },
          } = rowAction;

          const actions: TableRowActionProps[] =
            rowAction?.tableActionRender?.(record, index) || [];

          if (onUpdate) {
            actions.push({
              ...updateProps,
              text: updateButtonText,
              onClick: async () => await onUpdate(record),
              permission: updateAccess,
              key: "_update",
              sort: 0,
            });
          }

          if (onDelete) {
            actions.push({
              ...deleteProps,
              text: deleteButtonText,
              popconfirmProps: deletePopconfirmProps,
              onClick: async () => await onDelete(record),
              type: "danger",
              permission: deleteAccess,
              key: "_delelte",
              sort: 0,
            });
          }

          const allActions = sortBy(
            actions.map((i) => ({ ...i, sort: i.sort ?? 0 })),
            "sort",
          )?.filter((tableColumnProps: TableRowActionProps) => {
            // 权限过滤
            if (
              typeof tableColumnProps.permission === "string" &&
              !permissions?.includes(tableColumnProps.permission)
            ) {
              return false;
            }

            // 展示条件
            if (typeof tableColumnProps.visible !== "function") return true;
            return tableColumnProps.visible();
          });

          const actionDoms = allActions
            ?.filter((i) => i.more !== true)
            ?.map((tableColumnProps: any, index: number) => {
              return (
                <TableRowAction
                  // 权限已经在filter中过滤，这边不传
                  {...omit(tableColumnProps, "permission")}
                  key={
                    tableColumnProps.key ||
                    tableColumnProps.permission ||
                    `action_${index}`
                  }
                />
              );
            });
          const moreActions = allActions
            ?.filter((i) => i.more === true)
            ?.map((tableColumnProps: any, index: number) => {
              return (
                <TableRowAction
                  // 权限已经在filter中过滤，这边不传
                  {...omit(tableColumnProps, "permission")}
                  key={
                    tableColumnProps.key ||
                    tableColumnProps.permission ||
                    `action_${index}`
                  }
                  theme="a"
                />
              );
            });

          const tableColumnRender =
            rowAction?.tableColumnRender || ((dom: any) => dom);

          return tableColumnRender(
            <Space {...(props ?? {})}>
              {allActions?.length === 0 ? "-" : null}
              {actionDoms?.filter((i: any) => !!i)?.length > 0
                ? actionDoms
                : null}
              {moreActions?.length > 0 ? (
                <Dropdown
                  zIndex={1}
                  keepDOM
                  render={
                    <Dropdown.Menu>
                      {moreActions.map((action) => {
                        return (
                          <Dropdown.Item
                            key={action.key}
                            onClick={() => {
                              if (action?.props?.popconfirmProps) {
                                Modal.confirm({
                                  ...(action?.props?.popconfirmProps || {}),
                                  zIndex: 2,
                                  onOk: async () => {
                                    await action?.props?.onClick?.();
                                  },
                                });
                              } else {
                                action?.props?.onClick?.();
                              }
                            }}
                          >
                            {action}
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  }
                  trigger="click"
                >
                  <A>更多</A>
                </Dropdown>
              ) : null}
            </Space>,
            undefined,
            record,
          );
        },
      });
      return cols;
    }, [columns, tableInnerProps.cols.value]);

    const mixedPagination = useMemo(() => {
      if (pagination === false) return false;
      let userPagination = { ...defaultPaginationProps };
      if (typeof pagination !== "boolean")
        userPagination = {
          ...userPagination,
          ...pagination,
        };

      return {
        ...userPagination,
        currentPage: paginationHook.current,
        pageSize: paginationHook.pageSize,
        total: paginationHook.total,
        onChange: paginationHook.onChange,
      };
    }, [pagination, paginationHook]);

    const Container = useMemo(() => {
      if (containerType === "none") {
        return React.Fragment;
      }
      return Card;
    }, [containerType]);

    return (
      <SchemaContext.Provider
        value={{
          scene: "table",
          changedValue: {},
          valueVersion: 0,
        }}
      >
        {filters.length > 0 && hideFilterBar !== true ? (
          <Card style={{ marginBottom: 20 }}>
            <SchemaFilter
              {...filterProps}
              initValues={realFilterInitValues}
              getFormApi={(f) => (filterRef.current = f)}
              onSubmit={(value) => {
                setWhere(value);
              }}
              onReset={() => {
                setWhere([]);
              }}
              columns={filters}
              beforeFilter={beforeFilter}
            />
          </Card>
        ) : null}
        <Container>
          {tab ? (
            <Tabs
              tabList={tab.tabList}
              activeKey={currentTabValue}
              onChange={setCurrentTabValue}
            />
          ) : null}
          {hideActionBar ? null : ActionBar}
          <SemiTable
            {...tableInnerProps}
            {...tableProps}
            scroll={scroll}
            rowKey={rowKey}
            pagination={mixedPagination}
            dataSource={tableData?.map(valueTransform)}
            loading={loading || tableProps.loading}
            columns={tableColumns}
            onChange={({ sorter }) => {
              if (sorter?.dataIndex)
                setSorter({
                  [sorter.dataIndex]:
                    typeof sorter.sortOrder === "boolean"
                      ? undefined
                      : SORT_DIRECTIONS_MAP[sorter.sortOrder],
                });
            }}
          />
        </Container>
      </SchemaContext.Provider>
    );
  },
);
