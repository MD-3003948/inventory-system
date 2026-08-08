import { useEffect, useState } from "react";
import { customersApi, itemsApi } from "../api";
import type { Customer, InventoryItem, OrderLineItemInput, SalesOrderInput } from "../types";

interface SalesOrderFormProps {
  onSubmit: (order: SalesOrderInput) => Promise<void>;
}

export function SalesOrderForm({ onSubmit }: SalesOrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [lineItems, setLineItems] = useState<OrderLineItemInput[]>([{ inventoryItemId: 0, quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customersApi.list().then(setCustomers).catch(() => {});
    itemsApi.list().then(setItems).catch(() => {});
  }, []);

  const updateLine = (index: number, patch: Partial<OrderLineItemInput>) => {
    setLineItems((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const addLine = () => setLineItems((prev) => [...prev, { inventoryItemId: 0, quantity: 1 }]);
  const removeLine = (index: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setCustomerId("");
    setLineItems([{ inventoryItemId: 0, quantity: 1 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validLines = lineItems.filter((l) => l.inventoryItemId > 0 && l.quantity > 0);
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
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-4">
      <select
        required
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">Select a customer...</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} {c.company ? `(${c.company})` : ""}
          </option>
        ))}
      </select>

      <div className="mt-3 flex flex-col gap-2">
        {lineItems.map((line, index) => (
          <div key={index} className="flex gap-2">
            <select
              value={line.inventoryItemId}
              onChange={(e) => updateLine(index, { inventoryItemId: Number(e.target.value) })}
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value={0}>Select an item...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (${item.unitPrice.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })}
              className="w-24 rounded border border-gray-300 px-3 py-2 text-sm"
            />
            {lineItems.length > 1 && (
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addLine}
          className="self-start text-sm font-medium text-indigo-600 hover:underline"
        >
          + Add item
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        Create Order
      </button>
    </form>
  );
}
