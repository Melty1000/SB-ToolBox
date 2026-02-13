import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    images: { unoptimized: true },
    basePath: "/SB-ToolBox",
    assetPrefix: "/SB-ToolBox",
    trailingSlash: true,
};

export default nextConfig;
