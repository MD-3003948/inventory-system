import type {
  InventoryItem,
  InventoryItemInput,
  LoginRequest,
  LoginResponse,
  CurrentUser,
  Customer,
  CustomerInput,
  SalesOrder,
  SalesOrderInput,
  SalesOrderStatus,
  DashboardMetrics,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_STORAGE_KEY = "auth_token";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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
    throw new ApiError(401, "Not authenticated");
  }

  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${res.status} ${res.statusText}`);
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

export const customersApi = {
  list: () => request<Customer[]>("/customers"),
  create: (customer: CustomerInput) =>
    request<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    }),
  update: (id: number, customer: CustomerInput) =>
    request<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    }),
  remove: (id: number) =>
    request<void>(`/customers/${id}`, { method: "DELETE" }),
};

export const salesOrdersApi = {
  list: () => request<SalesOrder[]>("/salesorders"),
  create: (order: SalesOrderInput) =>
    request<SalesOrder>("/salesorders", {
      method: "POST",
      body: JSON.stringify(order),
    }),
  updateStatus: (id: number, status: SalesOrderStatus) =>
    request<SalesOrder>(`/salesorders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  remove: (id: number) =>
    request<void>(`/salesorders/${id}`, { method: "DELETE" }),
};

export const dashboardApi = {
  getMetrics: (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    const query = params.toString();
    return request<DashboardMetrics>(`/dashboard/metrics${query ? `?${query}` : ""}`);
  },
};
