const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

/* ----------------------------------------------------
   Helpers
---------------------------------------------------- */

const isBrowser = (): boolean => typeof window !== "undefined";

/* ----------------------------------------------------
   Token
---------------------------------------------------- */

export const setToken = (token: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
};

/* ----------------------------------------------------
   User
---------------------------------------------------- */

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: any; // allow additional backend fields
}

export const setUser = (user: AuthUser): void => {
  if (!isBrowser()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): AuthUser | null => {
  if (!isBrowser()) return null;

  const user = localStorage.getItem(USER_KEY);
  return user ? (JSON.parse(user) as AuthUser) : null;
};

export const removeUser = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(USER_KEY);
};

/* ----------------------------------------------------
   Clear All
---------------------------------------------------- */

export const clearAuth = (): void => {
  removeToken();
  removeUser();
};
