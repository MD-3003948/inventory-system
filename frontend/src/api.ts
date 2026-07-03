import type { InventoryItem, InventoryItemInput } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

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
