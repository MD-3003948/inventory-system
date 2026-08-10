import { useEffect, useState } from "react";
import { customersApi, productsApi } from "../api";
import type { Customer, Product, OrderLineItemInput, SalesOrderInput } from "../types";

interface SalesOrderFormProps {
  onSubmit: (order: SalesOrderInput) => Promise<void>;
}

export function SalesOrderForm({ onSubmit }: SalesOrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [lineItems, setLineItems] = useState<OrderLineItemInput[]>([{ productId: 0, quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customersApi.list().then(setCustomers).catch(() => {});
    productsApi.list().then(setProducts).catch(() => {});
  }, []);

  const updateLine = (index: number, patch: Partial<OrderLineItemInput>) => {
    setLineItems((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const addLine = () => setLineItems((prev) => [...prev, { productId: 0, quantity: 1 }]);
  const removeLine = (index: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setCustomerId("");
    setLineItems([{ productId: 0, quantity: 1 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validLines = lineItems.filter((l) => l.productId > 0 && l.quantity > 0);
    if (!customerId || validLines.length === 0) {
      setError("Pick a customer and at least one item with a quantity.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ customerId, lineItems: validLines });
      resetForm();
    } catch {
      setError("Could not create the order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="terminal-panel p-4">
      <select
        required
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")}
        className="terminal-input w-full"
      >
        <option value="">Select a customer...</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id} className="bg-term-bg text-term-green">
            {c.name} {c.company ? `(${c.company})` : ""}
          </option>
        ))}
      </select>

      <div className="mt-3 flex flex-col gap-2">
        {lineItems.map((line, index) => (
          <div key={index} className="flex gap-2">
            <select
              value={line.productId}
              onChange={(e) => updateLine(index, { productId: Number(e.target.value) })}
              className="terminal-input flex-1"
            >
              <option value={0}>Select an item...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id} className="bg-term-bg text-term-green">
                  {product.name} (${product.unitPrice.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })}
              className="terminal-input w-24"
            />
            {lineItems.length > 1 && (
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="text-sm text-term-danger hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addLine}
          className="self-start text-sm font-medium uppercase tracking-wide text-term-amber hover:underline"
        >
          + Add item
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-term-danger">{error}</p>}

      <button type="submit" disabled={submitting} className="terminal-button mt-4">
        Create Order
      </button>
    </form>
  );
}
