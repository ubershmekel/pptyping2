const FALLBACK_BASE_URL = "/";

type ViteImportMeta = ImportMeta & {
  env?: {
    BASE_URL?: string;
  };
};

export function normalizeBasePath(basePath: string): string {
  const trimmed = (basePath || FALLBACK_BASE_URL).trim();
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export function getAppBasePath(): string {
  const viteImportMeta = import.meta as ViteImportMeta;
  return normalizeBasePath(viteImportMeta.env?.BASE_URL ?? FALLBACK_BASE_URL);
}

export function stripBasePath(
  pathname: string,
  basePath = getAppBasePath(),
): string {
  const normalizedBase = normalizeBasePath(basePath);
  const baseRoot = normalizedBase.slice(0, -1);
  const path = pathname || "/";

  if (normalizedBase === "/") return path;
  if (path === baseRoot) return "/";
  if (!path.startsWith(normalizedBase)) return path;

  const remainder = path.slice(normalizedBase.length);
  return remainder ? `/${remainder}` : "/";
}

export function withBasePath(
  path: string,
  basePath = getAppBasePath(),
): string {
  const normalizedBase = normalizeBasePath(basePath);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedBase === "/") return normalizedPath;
  if (normalizedPath === "/") return normalizedBase;
  return `${normalizedBase.slice(0, -1)}${normalizedPath}`;
}
