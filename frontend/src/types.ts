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

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  createdAt: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export type SalesOrderStatus = "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled";

export const SALES_ORDER_STATUSES: SalesOrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Completed",
  "Cancelled",
];

export interface OrderLineItemInput {
  inventoryItemId: number;
  quantity: number;
}

export interface OrderLineItem {
  id: number;
  inventoryItemId: number;
  inventoryItemName: string;
  inventoryItemSku: string;
  quantity: number;
  unitPriceAtSale: number;
  lineTotal: number;
}

export interface SalesOrderInput {
  customerId: number;
  lineItems: OrderLineItemInput[];
}

export interface SalesOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  status: SalesOrderStatus;
  orderDate: string;
  totalAmount: number;
  lineItems: OrderLineItem[];
}

export interface TopItemMetric {
  inventoryItemId: number;
  name: string;
  sku: string;
  quantitySold: number;
  currentStock: number;
}

export interface TopCustomerMetric {
  customerId: number;
  name: string;
  company: string;
  orderCount: number;
  totalSpend: number;
}

export interface DashboardMetrics {
  salesOrdersInProgress: number;
  revenueInRange: number;
  fromDate: string;
  toDate: string;
  topItems: TopItemMetric[];
  topCustomers: TopCustomerMetric[];
}
