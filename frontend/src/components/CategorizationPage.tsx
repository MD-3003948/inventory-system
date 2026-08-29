import { useEffect, useState } from "react";
import { lookupsApi, ApiError } from "../api";
import { PartCategoryForm } from "./PartCategoryForm";
import { PartSubCategoryForm } from "./PartSubCategoryForm";
import type { PartCategory, PartCategoryInput, PartSubCategory, PartSubCategoryInput } from "../types";

export function CategorizationPage() {
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [subCategories, setSubCategories] = useState<PartSubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingCategory, setEditingCategory] = useState<PartCategory | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<PartSubCategory | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cats, subs] = await Promise.all([lookupsApi.partCategories(), lookupsApi.partSubCategories()]);
      setCategories(cats);
      setSubCategories(subs);
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? "—";

  const handleCategorySubmit = async (input: PartCategoryInput) => {
    setError(null);
    try {
      if (editingCategory) {
        await lookupsApi.updatePartCategory(editingCategory.id, input);
        setEditingCategory(null);
      } else {
        await lookupsApi.createPartCategory(input);
      }
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the category.");
    }
  };

  const handleCategoryDelete = async (id: number) => {
    setError(null);
    try {
      await lookupsApi.removePartCategory(id);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the category.");
    }
  };

  const handleSubCategorySubmit = async (input: PartSubCategoryInput) => {
    setError(null);
    try {
      if (editingSubCategory) {
        await lookupsApi.updatePartSubCategory(editingSubCategory.id, input);
        setEditingSubCategory(null);
      } else {
        await lookupsApi.createPartSubCategory(input);
      }
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the sub-category.");
    }
  };

  const handleSubCategoryDelete = async (id: number) => {
    setError(null);
    try {
      await lookupsApi.removePartSubCategory(id);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the sub-category.");
    }
  };

  return (
    <div className="mx-auto w-[95%] py-10">
      <h1 className="text-2xl font-semibold">Categorization</h1>
      <p className="mt-1 text-sm text-term-green/60">Manage part categories and sub-categories.</p>

      {error && <p className="mt-4 text-sm text-term-danger">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-sm">Part Categories</h2>
          <div className="mt-3">
            <PartCategoryForm
              editingCategory={editingCategory}
              onSubmit={handleCategorySubmit}
              onCancelEdit={() => setEditingCategory(null)}
            />
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-term-green/60">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="mt-6 text-sm text-term-green/60">No part categories yet. Add one above.</p>
          ) : (
            <table className="mt-6 w-full border-collapse border-2 border-term-amber text-left text-sm">
              <thead className="bg-term-panel text-term-amber">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-t border-term-amber/30">
                    <td className="px-4 py-2 font-medium">{c.name}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => setEditingCategory(c)} className="mr-3 text-term-amber hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleCategoryDelete(c.id)} className="text-term-danger hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h2 className="text-sm">Part Sub-Categories</h2>
          <div className="mt-3">
            <PartSubCategoryForm
              categories={categories}
              editingSubCategory={editingSubCategory}
              onSubmit={handleSubCategorySubmit}
              onCancelEdit={() => setEditingSubCategory(null)}
            />
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-term-green/60">Loading...</p>
          ) : subCategories.length === 0 ? (
            <p className="mt-6 text-sm text-term-green/60">No sub-categories yet. Add one above.</p>
          ) : (
            <table className="mt-6 w-full border-collapse border-2 border-term-amber text-left text-sm">
              <thead className="bg-term-panel text-term-amber">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {subCategories.map((s) => (
                  <tr key={s.id} className="border-t border-term-amber/30">
                    <td className="px-4 py-2 font-medium">{s.name}</td>
                    <td className="px-4 py-2 text-term-green/70">{categoryName(s.partCategoryId)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => setEditingSubCategory(s)}
                        className="mr-3 text-term-amber hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleSubCategoryDelete(s.id)} className="text-term-danger hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
