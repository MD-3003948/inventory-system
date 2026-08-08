export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemInput {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userCode: string;
  firstName: string;
  lastName: string;
  privilegeLevel: number;
}

export interface CurrentUser {
  userCode: string;
  firstName: string;
  lastName: string;
  username: string;
  organization: string;
  privilegeLevel: number;
  lastLoginAt: string | null;
}
