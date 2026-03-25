import { getBaseName } from "../runtimeEnv";

const POST_LOGIN_REDIRECT_KEY = "post_login_redirect";

function normalizeBaseName(value = "") {
  if (!value || value === "/") return "";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

function normalizeRedirectPath(path) {
  if (typeof path !== "string") return "";
  if (!path.startsWith("/")) return "";
  return path;
}

export function getLoginPath() {
  const baseName = normalizeBaseName(getBaseName());
  return `${baseName}/login` || "/login";
}

export function savePostLoginRedirect(path) {
  const normalizedPath = normalizeRedirectPath(path);
  if (!normalizedPath || typeof window === "undefined") return;

  window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, normalizedPath);
}

export function getSavedPostLoginRedirect() {
  if (typeof window === "undefined") return "";

  return normalizeRedirectPath(
    window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY) || "",
  );
}

export function clearPostLoginRedirect() {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
}

export function getCurrentAppPath() {
  if (typeof window === "undefined") return "/";

  const baseName = normalizeBaseName(getBaseName());
  const pathname = window.location.pathname || "/";
  const search = window.location.search || "";
  const pathWithoutBase =
    baseName && pathname.startsWith(baseName)
      ? pathname.slice(baseName.length) || "/"
      : pathname;
  const normalizedPath = normalizeRedirectPath(pathWithoutBase) || "/";

  return `${normalizedPath}${search}`;
}
