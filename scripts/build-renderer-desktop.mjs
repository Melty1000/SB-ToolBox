import { execSync } from "node:child_process";

try {
  execSync("npx next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      SB_TOOLBOX_BASE_PATH: "",
      NEXT_PUBLIC_BASE_PATH: "",
    },
  });
  process.exit(0);
} catch (error) {
  const code = typeof error?.status === "number" ? error.status : 1;
  process.exit(code);
}
