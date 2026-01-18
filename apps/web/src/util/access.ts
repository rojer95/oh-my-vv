import { isArray } from "lodash-es";

export const checkAccess = (
  access?: string | RegExp,
  permissions?: string[]
) => {
  if (!access) return true;
  if (!permissions || !isArray(permissions) || permissions.length === 0)
    return false;

  if (typeof access === "string") {
    return permissions.includes(access);
  }

  if (access instanceof RegExp) {
    return permissions.some((i) => access.test(i));
  }

  return false;
};
