import Elysia from "elysia";

export const ipPlugin = new Elysia().resolve(
  { as: "global" },
  ({ request, server }) => {
    const ip =
      server?.requestIP(request)?.address ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    return { ip };
  },
);
