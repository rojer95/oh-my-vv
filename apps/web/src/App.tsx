import { VersionTag } from "@/component/version-tag.tsx";
import { useDark } from "@/hook/dark.hook";
import { RouterProvider } from "react-router-dom";
import { router } from "./config/route";

function App() {
  useDark();
  return (
    <>
      <VersionTag />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
