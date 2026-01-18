export const getPagerData = (
  res: any
): { list: any[]; total: number; hasMore?: boolean } => {
  if (Array.isArray(res)) {
    if (
      res.length === 2 &&
      Array.isArray(res[0]) &&
      typeof res[1] === "number"
    ) {
      return { list: res[0], total: res[1] };
    } else {
      return { list: res, total: res.length };
    }
  }

  if (res && "rows" in res && "count" in res) {
    return { list: res.rows, total: res.count };
  }

  console.warn("Table解析返回数据格式失败");
  return { list: [], total: 0 };
};
