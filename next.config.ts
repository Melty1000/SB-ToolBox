import type { NextConfig } from "next";

const normalizeBasePath = (input: string | undefined) => {
    const raw = (input || "").trim();
    if (!raw || raw === "/") return "";

    // Guard against accidental filesystem-style values (e.g. D:\foo, D:/foo, /D:/foo).
    if (/^\/?[a-zA-Z]:[\\/]/.test(raw) || raw.includes("\\") || /^https?:\/\//i.test(raw)) {
        return "";
    }

    const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
    const normalized = withLeadingSlash.replace(/\/+$/, "");
    return normalized || "";
};

const normalizedBasePath = normalizeBasePath(
    process.env.SB_TOOLBOX_BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH
);

const nextConfig: NextConfig = {
    output: "export",
    images: { unoptimized: true },
    trailingSlash: true,
    ...(normalizedBasePath
        ? {
            basePath: normalizedBasePath,
            assetPrefix: normalizedBasePath,
        }
        : {}),
};

export default nextConfig;
