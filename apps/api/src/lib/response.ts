import Elysia, { ElysiaCustomStatusResponse } from "elysia";

export const responsePlugin = () =>
  new Elysia({ name: "lib_response" }).mapResponse(
    { as: "global" },
    ({ responseValue, set }) => {
      set.status = 200;
      if (responseValue instanceof ElysiaCustomStatusResponse) {
        return Response.json(responseValue.response);
      }
      return Response.json({
        code: 0,
        data: responseValue,
      });
    },
  );
