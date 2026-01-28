import type { PermissionTreeNode } from "./permission-data";
import { PERMISSION_TREE } from "./permission-data";

function buildFullKey(
  node: Readonly<PermissionTreeNode>,
  parentKey?: string,
): string {
  return parentKey ? `${parentKey}:${node.key}` : node.key;
}

function processTreeWithFullKeys(
  nodes: readonly PermissionTreeNode[],
  parentKey = "",
): PermissionTreeNode[] {
  return nodes.map((node) => {
    const fullKey = parentKey ? `${parentKey}:${node.key}` : node.key;
    return {
      ...node,
      key: fullKey,
      children: node.children
        ? processTreeWithFullKeys(node.children, fullKey)
        : undefined,
    };
  });
}

function flattenPermissions(
  nodes: readonly PermissionTreeNode[],
  parentKey = "",
  result: Record<string, PermissionTreeNode> = {},
): Record<string, PermissionTreeNode> {
  for (const node of nodes) {
    const fullKey = buildFullKey(node, parentKey);

    if (!node.children) {
      const camelCaseKey = fullKey
        .split(":")
        .map((part, index) =>
          index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
        )
        .join("");

      result[camelCaseKey] = { ...node, key: fullKey };
    } else {
      flattenPermissions(node.children, fullKey, result);
    }
  }

  return result;
}

export function filterPermissionTree(
  nodes: readonly PermissionTreeNode[],
  filter: (node: PermissionTreeNode) => boolean,
): PermissionTreeNode[] {
  return nodes
    .map((node) => {
      return {
        ...node,
        children: node.children
          ? filterPermissionTree(node.children, filter)
          : undefined,
      };
    })
    .filter((o) => {
      const filterRes = filter(o);
      if (filterRes === false) return false;
      if (o.children?.length === 0) return false;
      return true;
    });
}

export function getPermission(key: string): PermissionTreeNode | undefined {
  function search(
    nodes: readonly PermissionTreeNode[],
    parentKey = "",
  ): PermissionTreeNode | undefined {
    for (const node of nodes) {
      const fullKey = buildFullKey(node, parentKey);

      if (fullKey === key) {
        return { ...node, key: fullKey };
      }

      if (node.children) {
        const found = search(node.children, fullKey);
        if (found) return found;
      }
    }
    return undefined;
  }

  return search(PERMISSION_TREE);
}

type CamelCase<S extends string> = S extends `${infer P}:${infer R}`
  ? `${P}${Capitalize<CamelCase<R>>}`
  : S;

type FlattenButtonPermissions<
  T,
  ParentKey extends string = "",
> = T extends readonly {
  key: infer K extends string;
  children?: infer C;
}[]
  ? {
      [I in keyof T]: T[I] extends {
        key: infer Key extends string;
        children?: infer Children;
      }
        ? Children extends readonly {
            key: string;
            children?: any;
          }[]
          ? // 如果有 children，继续递归
            FlattenButtonPermissions<Children, `${ParentKey}${Key}:`>
          : // 如果没有 children，这就是一个权限节点
            CamelCase<`${ParentKey}${Key}`>
        : never;
    }[number]
  : never;

export type AllPermissionKeys = FlattenButtonPermissions<
  typeof PERMISSION_TREE
>;

export { PERMISSION_TREE };

export const FULL_KEY_PERMISSION_TREE =
  processTreeWithFullKeys(PERMISSION_TREE);

export const PERMISSIONS: Record<AllPermissionKeys, PermissionTreeNode> =
  flattenPermissions(PERMISSION_TREE) as any;
