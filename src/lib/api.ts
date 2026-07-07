const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export function resolveApiUrl(
  path: string,
  apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL ?? ""
): string {
  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  const normalizedBaseUrl = apiBaseUrl.trim().replace(/\/+$/, "");
  if (!normalizedBaseUrl) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}

const TOKEN_KEY = "pragent.auth.token";

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init?.headers ?? {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolveApiUrl(input), { ...init, headers });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("pragent.auth.user");
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.assign("/login");
    }
  }

  return response;
}
