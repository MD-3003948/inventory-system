import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productsApi, lookupsApi, customersApi, departmentsApi } from "../api";
import type { Product, PartCategory, PartSubCategory, Customer, Department } from "../types";
import { FormField } from "./FormField";

export function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [subCategories, setSubCategories] = useState<PartSubCategory[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [sku, setSku] = useState("");
  const [partCategoryId, setPartCategoryId] = useState<number | "">("");
  const [partSubCategoryId, setPartSubCategoryId] = useState<number | "">("");
  const [assignedCustomerId, setAssignedCustomerId] = useState<number | "">("");
  const [departmentId, setDepartmentId] = useState<number | "">("");

  useEffect(() => {
    lookupsApi.partCategories().then(setCategories).catch(() => {});
    customersApi.list().then(setCustomers).catch(() => {});
    departmentsApi.list().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    lookupsApi
      .partSubCategories(partCategoryId || undefined)
      .then(setSubCategories)
      .catch(() => {});
    setPartSubCategoryId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partCategoryId]);

  const runSearch = async () => {
    setLoading(true);
    try {
      setProducts(
        await productsApi.list({
          sku: sku || undefined,
          partCategoryId: partCategoryId || undefined,
          partSubCategoryId: partSubCategoryId || undefined,
          assignedCustomerId: assignedCustomerId || undefined,
          departmentId: departmentId || undefined,
        })
      );
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-[95%] py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-term-green/60">Search the part catalog.</p>
        </div>
        <button onClick={() => navigate("/products/new")} className="terminal-button">
          Create
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
        className="terminal-panel mt-6 grid grid-cols-2 gap-3 p-4 sm:grid-cols-4"
      >
        <FormField label="Search by SKU" className="col-span-2 sm:col-span-1">
          <input
            placeholder="Search by SKU..."
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="terminal-input"
          />
        </FormField>
        <FormField label="Part Category">
          <select
            value={partCategoryId}
            onChange={(e) => setPartCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="terminal-input"
          >
            <option value="">All Part Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-term-bg text-term-green">
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Sub-Category">
          <select
            value={partSubCategoryId}
            onChange={(e) => setPartSubCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="terminal-input"
          >
            <option value="">All Sub-Categories</option>
            {subCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-term-bg text-term-green">
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Assigned Customer">
          <select
            value={assignedCustomerId}
            onChange={(e) => setAssignedCustomerId(e.target.value ? Number(e.target.value) : "")}
            className="terminal-input"
          >
            <option value="">All Assigned Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id} className="bg-term-bg text-term-green">
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Department">
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : "")}
            className="terminal-input"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="bg-term-bg text-term-green">
                {d.name}
              </option>
            ))}
          </select>
        </FormField>
        <div className="col-span-2 sm:col-span-4">
          <button type="submit" className="terminal-button">
            Search
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-term-danger">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm text-term-green/60">Loading...</p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-sm text-term-green/60">No products match your search.</p>
      ) : (
        <table className="mt-6 w-full border-collapse border-2 border-term-amber text-left text-sm">
          <thead className="bg-term-panel text-term-amber">
            <tr>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Sub-Category</th>
              <th className="px-4 py-2 text-right">Quantity</th>
              <th className="px-4 py-2 text-right">Cost/Unit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="cursor-pointer border-t border-term-amber/30 hover:bg-term-panel"
              >
                <td className="px-4 py-2 font-medium">
                  <Link to={`/products/${p.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                    {p.sku}
                  </Link>
                </td>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2 text-term-green/70">{p.partCategoryName}</td>
                <td className="px-4 py-2 text-term-green/70">{p.partSubCategoryName}</td>
                <td className="px-4 py-2 text-right text-term-green/70">{p.quantity}</td>
                <td className="px-4 py-2 text-right text-term-green/70">${p.unitPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
