import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productsApi } from "../api";
import type { Product } from "../types";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/api\/?$/, "");

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-term-amber">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    productsApi
      .get(Number(id))
      .then(setProduct)
      .catch(() => setError("Could not load this product."));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto w-[95%] py-10">
        <p className="text-sm text-term-danger">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto w-[95%] py-10">
        <p className="text-sm text-term-green/60">Loading...</p>
      </div>
    );
  }

  const imageSrc = product.imageUrl ? `${API_ORIGIN}${product.imageUrl}` : null;

  return (
    <div className="mx-auto w-[95%] py-10">
      <button onClick={() => navigate("/products")} className="text-sm text-term-amber hover:underline">
        &larr; Back to Products
      </button>

      <div className="terminal-panel mt-4 grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
        <div className="sm:col-span-1">
          {imageSrc ? (
            <img src={imageSrc} alt={product.name} className="w-full border-2 border-term-amber/60 object-contain" />
          ) : (
            <div className="flex h-48 items-center justify-center border-2 border-dashed border-term-amber/40 text-sm text-term-green/50">
              No image
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-sm text-term-green/60">{product.sku}</p>
          {product.description && <p className="mt-3 text-sm">{product.description}</p>}

          <div className="mt-6 grid grid-cols-2 gap-4 border-t-2 border-term-amber/30 pt-4 sm:grid-cols-3">
            <Field label="Part Category" value={product.partCategoryName} />
            <Field label="Part Sub-Category" value={product.partSubCategoryName} />
            <Field label="Customer Category" value={product.customerCategoryName} />
            <Field label="Attribute Template" value={product.attributeTemplateName ?? "—"} />
            <Field label="Assigned Customer" value={product.assignedCustomerName ?? "—"} />
            <Field label="Department" value={product.departmentName ?? "—"} />
            <Field label="Cost / Unit" value={`$${product.unitPrice.toFixed(2)}`} />
            <Field label="Quantity In Stock" value={product.quantity} />
            <Field label="Created By" value={product.createdByUserName} />
            <Field label="Created At" value={new Date(product.createdAt).toLocaleString()} />
          </div>
        </div>
      </div>
    </div>
  );
}
