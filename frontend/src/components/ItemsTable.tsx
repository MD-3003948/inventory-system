import type { InventoryItem } from "../types";

interface ItemsTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
}

export function ItemsTable({ items, onEdit, onDelete }: ItemsTableProps) {
  if (items.length === 0) {
    return <p className="mt-6 text-sm text-term-green/60">No inventory items yet. Add one above.</p>;
  }

  return (
    <table className="mt-6 w-full border-collapse border-2 border-term-amber text-left text-sm">
      <thead className="bg-term-panel text-term-amber">
        <tr>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">SKU</th>
          <th className="px-4 py-2">Category</th>
          <th className="px-4 py-2 text-right">Quantity</th>
          <th className="px-4 py-2 text-right">Unit Price</th>
          <th className="px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-term-amber/30">
            <td className="px-4 py-2 font-medium">{item.name}</td>
            <td className="px-4 py-2 text-term-green/70">{item.sku}</td>
            <td className="px-4 py-2 text-term-green/70">{item.category}</td>
            <td className="px-4 py-2 text-right text-term-green/70">{item.quantity}</td>
            <td className="px-4 py-2 text-right text-term-green/70">${item.unitPrice.toFixed(2)}</td>
            <td className="px-4 py-2 text-right">
              <button onClick={() => onEdit(item)} className="mr-3 text-term-amber hover:underline">
                Edit
              </button>
              <button onClick={() => onDelete(item.id)} className="text-term-danger hover:underline">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
