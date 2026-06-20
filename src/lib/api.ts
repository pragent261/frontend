import { clearAccessToken, getAccessToken } from "./auth";

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

export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(resolveApiUrl(input), {
    ...init,
    headers
  }).then((response) => {
    if (
      response.status === 401 &&
      !input.includes("/auth/login") &&
      !input.includes("/auth/register")
    ) {
      clearAccessToken();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return response;
  });
}
