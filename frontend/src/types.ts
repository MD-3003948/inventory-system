export interface PartCategory {
  id: number;
  name: string;
}

export interface PartSubCategory {
  id: number;
  name: string;
  partCategoryId: number;
}

export interface CustomerCategory {
  id: number;
  name: string;
}

export interface AttributeTemplate {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  partCategoryId: number;
  partCategoryName: string;
  partSubCategoryId: number;
  partSubCategoryName: string;
  attributeTemplateId: number | null;
  attributeTemplateName: string | null;
  customerCategoryId: number;
  customerCategoryName: string;
  assignedCustomerId: number | null;
  assignedCustomerName: string | null;
  imageUrl: string | null;
  createdByUserId: number;
  createdByUserName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateInput {
  sku: string;
  name: string;
  description: string;
  partCategoryId: number;
  partSubCategoryId: number;
  attributeTemplateId: number | null;
  customerCategoryId: number;
  assignedCustomerId: number | null;
  unitPrice: number;
  image: File | null;
}

export interface ProductUpdateInput {
  sku: string;
  name: string;
  description: string;
  partCategoryId: number;
  partSubCategoryId: number;
  attributeTemplateId: number | null;
  customerCategoryId: number;
  assignedCustomerId: number | null;
  quantity: number;
  unitPrice: number;
}

export interface ProductSearchParams {
  sku?: string;
  partCategoryId?: number;
  partSubCategoryId?: number;
  assignedCustomerId?: number;
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
  productId: number;
  quantity: number;
}

export interface OrderLineItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
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
  productId: number;
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

export interface ActiveCustomerOrderMetric {
  customerId: number;
  name: string;
  company: string;
  activeOrderCount: number;
}

export interface DashboardMetrics {
  salesOrdersInProgress: number;
  topItems: TopItemMetric[];
  topCustomers: TopCustomerMetric[];
  activeCustomerOrders: ActiveCustomerOrderMetric[];
}

export interface RevenuePoint {
  periodStart: string;
  revenue: number;
}

export interface RevenueSeries {
  granularity: string;
  totalRevenue: number;
  fromDate: string;
  toDate: string;
  points: RevenuePoint[];
}

export interface RevenueSeriesParams {
  fromDate?: string;
  toDate?: string;
  customerId?: number;
}
