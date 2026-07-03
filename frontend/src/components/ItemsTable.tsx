import type { InventoryItem } from "../types";

interface ItemsTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
}

export function ItemsTable({ items, onEdit, onDelete }: ItemsTableProps) {
  if (items.length === 0) {
    return <p className="mt-6 text-sm text-gray-500">No inventory items yet. Add one above.</p>;
  }

  return (
    <table className="mt-6 w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-left text-sm">
      <thead className="bg-gray-50 text-gray-600">
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
          <tr key={item.id} className="border-t border-gray-200">
            <td className="px-4 py-2 font-medium text-gray-900">{item.name}</td>
            <td className="px-4 py-2 text-gray-600">{item.sku}</td>
            <td className="px-4 py-2 text-gray-600">{item.category}</td>
            <td className="px-4 py-2 text-right text-gray-600">{item.quantity}</td>
            <td className="px-4 py-2 text-right text-gray-600">${item.unitPrice.toFixed(2)}</td>
            <td className="px-4 py-2 text-right">
              <button onClick={() => onEdit(item)} className="mr-3 text-indigo-600 hover:underline">
                Edit
              </button>
              <button onClick={() => onDelete(item.id)} className="text-red-600 hover:underline">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
