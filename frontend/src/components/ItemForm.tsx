import { useEffect, useState } from "react";
import type { InventoryItem, InventoryItemInput } from "../types";

const emptyForm: InventoryItemInput = {
  name: "",
  sku: "",
  category: "",
  quantity: 0,
  unitPrice: 0,
};

interface ItemFormProps {
  editingItem: InventoryItem | null;
  onSubmit: (item: InventoryItemInput) => Promise<void>;
  onCancelEdit: () => void;
}

export function ItemForm({ editingItem, onSubmit, onCancelEdit }: ItemFormProps) {
  const [form, setForm] = useState<InventoryItemInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(editingItem ? { ...editingItem } : emptyForm);
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!editingItem) setForm(emptyForm);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="terminal-panel grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
      <input
        required
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="terminal-input col-span-2 sm:col-span-1"
      />
      <input
        required
        placeholder="SKU"
        value={form.sku}
        onChange={(e) => setForm({ ...form, sku: e.target.value })}
        className="terminal-input"
      />
      <input
        placeholder="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="terminal-input"
      />
      <input
        required
        type="number"
        min={0}
        placeholder="Quantity"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
        className="terminal-input"
      />
      <input
        required
        type="number"
        min={0}
        step="0.01"
        placeholder="Unit Price"
        value={form.unitPrice}
        onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
        className="terminal-input"
      />
      <div className="col-span-2 flex gap-2 sm:col-span-5">
        <button type="submit" disabled={submitting} className="terminal-button">
          {editingItem ? "Save Changes" : "Add Item"}
        </button>
        {editingItem && (
          <button type="button" onClick={onCancelEdit} className="terminal-button-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
