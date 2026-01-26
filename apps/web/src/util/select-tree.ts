export const transformSelectTreeData = (
  data: any[],
  disabledPath?: string,
): any[] => {
  if (!data || !Array.isArray(data)) return [];

  return data.map((item) => ({
    key: String(item.id),
    label: item.name,
    value: item.id,
    disabled: disabledPath ? String(item.path).startsWith(disabledPath) : false,
    children: item.children
      ? transformSelectTreeData(item.children, disabledPath)
      : undefined,
  }));
};

export const getSelectTreeAllNodeIds = (
  data: any[],
  toString = true,
): string[] => {
  if (!data || !Array.isArray(data)) return [];

  const ids: Array<any> = [];
  data.forEach((item) => {
    ids.push(toString ? String(item.id) : item.id);
    if (item.children) {
      ids.push(...getSelectTreeAllNodeIds(item.children, toString));
    }
  });
  return ids;
};
