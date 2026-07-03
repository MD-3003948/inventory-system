import { useEffect, useState } from "react";
import { itemsApi } from "./api";
import { ItemForm } from "./components/ItemForm";
import { ItemsTable } from "./components/ItemsTable";
import type { InventoryItem, InventoryItemInput } from "./types";

function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      setItems(await itemsApi.list());
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (input: InventoryItemInput) => {
    if (editingItem) {
      await itemsApi.update(editingItem.id, input);
      setEditingItem(null);
    } else {
      await itemsApi.create(input);
    }
    await loadItems();
  };

  const handleDelete = async (id: number) => {
    await itemsApi.remove(id);
    await loadItems();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Inventory System</h1>
      <p className="mt-1 text-sm text-gray-500">Manage stock items for the demo warehouse.</p>

      <div className="mt-6">
        <ItemForm
          editingItem={editingItem}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingItem(null)}
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading...</p>
      ) : (
        <ItemsTable items={items} onEdit={setEditingItem} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default App;
