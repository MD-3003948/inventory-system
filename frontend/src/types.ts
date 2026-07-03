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
