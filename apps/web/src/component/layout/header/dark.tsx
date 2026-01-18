import { useDark } from "@/hook/dark.hook";
import { IconMoon, IconSun } from "@douyinfe/semi-icons";
import { Button } from "@douyinfe/semi-ui";

export const Dark = () => {
  const { dark, toggle } = useDark();
  return (
    <Button
      onClick={toggle}
      theme="borderless"
      icon={dark ? <IconSun size="large" /> : <IconMoon size="large" />}
    />
  );
};
