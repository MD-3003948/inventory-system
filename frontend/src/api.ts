import type {
  LoginRequest,
  LoginResponse,
  CurrentUser,
  Customer,
  CustomerInput,
  SalesOrder,
  SalesOrderInput,
  SalesOrderStatus,
  DashboardMetrics,
  RevenueSeries,
  RevenueSeriesParams,
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductSearchParams,
  PartCategory,
  PartCategoryInput,
  PartSubCategory,
  PartSubCategoryInput,
  CustomerCategory,
  AttributeTemplate,
  AttributeTemplateInput,
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
  const headers: HeadersInit = {};
  // Let the browser set Content-Type (with the multipart boundary) itself for FormData bodies.
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
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
    let message = `Request failed: ${res.status} ${res.statusText}`;
    const text = await res.text().catch(() => "");
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed === "string") message = parsed;
      } catch {
        message = text;
      }
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

function buildProductFormData(product: ProductCreateInput): FormData {
  const formData = new FormData();
  formData.set("Sku", product.sku);
  formData.set("Name", product.name);
  formData.set("Description", product.description);
  formData.set("PartCategoryId", String(product.partCategoryId));
  formData.set("PartSubCategoryId", String(product.partSubCategoryId));
  if (product.attributeTemplateId !== null) {
    formData.set("AttributeTemplateId", String(product.attributeTemplateId));
  }
  formData.set("CustomerCategoryId", String(product.customerCategoryId));
  if (product.assignedCustomerId !== null) {
    formData.set("AssignedCustomerId", String(product.assignedCustomerId));
  }
  formData.set("UnitPrice", String(product.unitPrice));
  if (product.image) {
    formData.set("Image", product.image);
  }
  return formData;
}

export const authApi = {
  login: (credentials: LoginRequest) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  me: () => request<CurrentUser>("/auth/me"),
};

export const productsApi = {
  list: (params?: ProductSearchParams) => {
    const query = new URLSearchParams();
    if (params?.sku) query.set("sku", params.sku);
    if (params?.partCategoryId) query.set("partCategoryId", String(params.partCategoryId));
    if (params?.partSubCategoryId) query.set("partSubCategoryId", String(params.partSubCategoryId));
    if (params?.assignedCustomerId) query.set("assignedCustomerId", String(params.assignedCustomerId));
    const qs = query.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<Product>(`/products/${id}`),
  create: (product: ProductCreateInput) =>
    request<Product>("/products", {
      method: "POST",
      body: buildProductFormData(product),
    }),
  update: (id: number, product: ProductUpdateInput) =>
    request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),
  remove: (id: number) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),
};

export const lookupsApi = {
  partCategories: () => request<PartCategory[]>("/lookups/part-categories"),
  createPartCategory: (input: PartCategoryInput) =>
    request<PartCategory>("/lookups/part-categories", { method: "POST", body: JSON.stringify(input) }),
  updatePartCategory: (id: number, input: PartCategoryInput) =>
    request<PartCategory>(`/lookups/part-categories/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  removePartCategory: (id: number) =>
    request<void>(`/lookups/part-categories/${id}`, { method: "DELETE" }),

  partSubCategories: (categoryId?: number) =>
    request<PartSubCategory[]>(
      `/lookups/part-sub-categories${categoryId ? `?categoryId=${categoryId}` : ""}`
    ),
  createPartSubCategory: (input: PartSubCategoryInput) =>
    request<PartSubCategory>("/lookups/part-sub-categories", { method: "POST", body: JSON.stringify(input) }),
  updatePartSubCategory: (id: number, input: PartSubCategoryInput) =>
    request<PartSubCategory>(`/lookups/part-sub-categories/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  removePartSubCategory: (id: number) =>
    request<void>(`/lookups/part-sub-categories/${id}`, { method: "DELETE" }),

  customerCategories: () => request<CustomerCategory[]>("/lookups/customer-categories"),

  attributeTemplates: () => request<AttributeTemplate[]>("/lookups/attribute-templates"),
  createAttributeTemplate: (input: AttributeTemplateInput) =>
    request<AttributeTemplate>("/lookups/attribute-templates", { method: "POST", body: JSON.stringify(input) }),
  updateAttributeTemplate: (id: number, input: AttributeTemplateInput) =>
    request<AttributeTemplate>(`/lookups/attribute-templates/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  removeAttributeTemplate: (id: number) =>
    request<void>(`/lookups/attribute-templates/${id}`, { method: "DELETE" }),
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
  getMetrics: () => request<DashboardMetrics>("/dashboard/metrics"),
  getRevenueSeries: (params: RevenueSeriesParams = {}) => {
    const query = new URLSearchParams();
    if (params.fromDate) query.set("fromDate", params.fromDate);
    if (params.toDate) query.set("toDate", params.toDate);
    if (params.customerId) query.set("customerId", String(params.customerId));
    const queryString = query.toString();
    return request<RevenueSeries>(`/dashboard/revenue-series${queryString ? `?${queryString}` : ""}`);
  },
};
