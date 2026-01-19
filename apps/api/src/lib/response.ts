import Elysia from "elysia";

export const responsePlugin = () =>
  new Elysia({ name: "lib_response" }).onAfterHandle(
    { as: "global" },
    ({ responseValue }) => {
      return Response.json({
        code: 0,
        data: responseValue,
      });
    },
  );
