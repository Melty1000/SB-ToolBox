import { execSync } from "node:child_process";

const packageVersion = process.env.npm_package_version || "0.1.0";
const prereleaseTag = packageVersion.includes("-")
  ? (packageVersion.split("-")[1] || "").split(".")[0].toUpperCase()
  : "";

try {
  execSync("npx next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      SB_TOOLBOX_BASE_PATH: "",
      NEXT_PUBLIC_BASE_PATH: "",
      NEXT_PUBLIC_APP_VERSION: packageVersion,
      NEXT_PUBLIC_APP_CHANNEL: prereleaseTag,
    },
  });
  process.exit(0);
} catch (error) {
  const code = typeof error?.status === "number" ? error.status : 1;
  process.exit(code);
}
