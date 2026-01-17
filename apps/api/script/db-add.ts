// eslint-disable-next-line @typescript-eslint/no-var-requires
import { execSync } from "child_process";

if (process.argv.length !== 3) {
  console.log("请输入文件名");
  process.exit(1);
}

const name = process.argv[2];

console.log(
  execSync(`bun run typeorm migration:create typeorm/migration/${name}`, {
    encoding: "utf8",
  })
);
