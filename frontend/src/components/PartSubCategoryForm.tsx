import { useEffect, useState } from "react";
import type { PartCategory, PartSubCategory, PartSubCategoryInput } from "../types";
import { FormField } from "./FormField";

interface PartSubCategoryFormProps {
  categories: PartCategory[];
  editingSubCategory: PartSubCategory | null;
  onSubmit: (input: PartSubCategoryInput) => Promise<void>;
  onCancelEdit: () => void;
}

export function PartSubCategoryForm({
  categories,
  editingSubCategory,
  onSubmit,
  onCancelEdit,
}: PartSubCategoryFormProps) {
  const emptyForm: PartSubCategoryInput = { name: "", partCategoryId: categories[0]?.id ?? 0 };
  const [form, setForm] = useState<PartSubCategoryInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(
      editingSubCategory
        ? { name: editingSubCategory.name, partCategoryId: editingSubCategory.partCategoryId }
        : { name: "", partCategoryId: categories[0]?.id ?? 0 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSubCategory, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!editingSubCategory) setForm({ name: "", partCategoryId: categories[0]?.id ?? 0 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="terminal-panel flex flex-wrap items-end gap-3 p-4">
      <FormField label="Sub-Category Name" className="min-w-[220px] flex-1">
        <input
          required
          placeholder="Sub-Category Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      <FormField label="Part Category">
        <select
          required
          value={form.partCategoryId}
          onChange={(e) => setForm({ ...form, partCategoryId: Number(e.target.value) })}
          className="terminal-input"
        >
          <option value="">Part Category...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-term-bg text-term-green">
              {c.name}
            </option>
          ))}
        </select>
      </FormField>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting || categories.length === 0} className="terminal-button">
          {editingSubCategory ? "Save Changes" : "Add Sub-Category"}
        </button>
        {editingSubCategory && (
          <button type="button" onClick={onCancelEdit} className="terminal-button-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
