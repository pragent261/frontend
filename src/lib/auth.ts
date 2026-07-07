import { resolveApiUrl } from "./api";

const TOKEN_KEY = "pragent.auth.token";
const USER_KEY = "pragent.auth.user";

export type AuthUser = {
  id: string;
  username: string | null;
  email: string | null;
  display_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

function persistSession(data: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const response = await fetch(resolveApiUrl("/v1/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    let detail = "用户名或密码错误";
    try {
      const body = (await response.json()) as { detail?: string };
      if (body?.detail) {
        detail = body.detail;
      }
    } catch {
      // ignore parse errors, keep default detail
    }
    throw new Error(detail);
  }

  const data = (await response.json()) as AuthResponse;
  persistSession(data);
  return data.user;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
