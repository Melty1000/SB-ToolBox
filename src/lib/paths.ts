const normalizeBasePath = (input: string | undefined) => {
    const raw = (input || "").trim();
    if (!raw || raw === "/") return "";

    // Reject filesystem/URL values that would break static asset resolution.
    // Handles drive-prefixed values with or without a leading slash.
    if (/^\/?[a-zA-Z]:[\\/]/.test(raw) || raw.includes("\\") || /^https?:\/\//i.test(raw)) {
        return "";
    }

    const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
    const normalized = withLeadingSlash.replace(/\/+$/, "");
    return normalized || "";
};

export const BASE_PATH = normalizeBasePath(
    process.env.SB_TOOLBOX_BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH
);

export const withBasePath = (value: string) => {
    if (!value) return BASE_PATH || "/";
    const normalized = value.startsWith("/") ? value : `/${value}`;
    return `${BASE_PATH}${normalized}`;
};
