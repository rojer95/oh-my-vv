import Elysia from "elysia";

export const responsePlugin = () =>
  new Elysia({ name: "lib_response" }).onAfterHandle(
    { as: "global" },
    ({ responseValue }) => {
      if (responseValue instanceof Response) {
        return responseValue;
      }

      return Response.json({
        code: 0,
        data: responseValue,
      });
    },
  );
