import type {
  InventoryItem,
  InventoryItemInput,
  LoginRequest,
  LoginResponse,
  CurrentUser,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_STORAGE_KEY = "auth_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (res.status === 401) {
    clearStoredToken();
    window.dispatchEvent(new Event("auth:unauthorized"));
    throw new Error("Not authenticated");
  }

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const authApi = {
  login: (credentials: LoginRequest) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  me: () => request<CurrentUser>("/auth/me"),
};

export const itemsApi = {
  list: () => request<InventoryItem[]>("/items"),
  create: (item: InventoryItemInput) =>
    request<InventoryItem>("/items", {
      method: "POST",
      body: JSON.stringify(item),
    }),
  update: (id: number, item: InventoryItemInput) =>
    request<InventoryItem>(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    }),
  remove: (id: number) =>
    request<void>(`/items/${id}`, { method: "DELETE" }),
};
