import { PERMISSION_TREE } from "./permission-data";

export interface PermissionTreeNode {
  key: string;
  name: string;
  type: string;
  children?: readonly PermissionTreeNode[];
  loggable?: boolean;
  action?: string;
}

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

    if (node.type === "button") {
      const camelCaseKey = fullKey
        .split(":")
        .map((part, index) =>
          index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
        )
        .join("");

      result[camelCaseKey] = { ...node, key: fullKey };
    }

    if (node.children) {
      flattenPermissions(node.children, fullKey, result);
    }
  }

  return result;
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
        type?: infer Type extends string;
      }
        ? Children extends readonly {
            key: string;
            children?: any;
          }[]
          ? Type extends "button"
            ?
                | CamelCase<`${ParentKey}${Key}`>
                | FlattenButtonPermissions<Children, `${ParentKey}${Key}:`>
            : FlattenButtonPermissions<Children, `${ParentKey}${Key}:`>
          : Type extends "button"
            ? CamelCase<`${ParentKey}${Key}`>
            : never
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
