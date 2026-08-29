import { useEffect, useState } from "react";
import type { PartCategory, PartCategoryInput } from "../types";
import { FormField } from "./FormField";

const emptyForm: PartCategoryInput = { name: "" };

interface PartCategoryFormProps {
  editingCategory: PartCategory | null;
  onSubmit: (input: PartCategoryInput) => Promise<void>;
  onCancelEdit: () => void;
}

export function PartCategoryForm({ editingCategory, onSubmit, onCancelEdit }: PartCategoryFormProps) {
  const [form, setForm] = useState<PartCategoryInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(editingCategory ? { name: editingCategory.name } : emptyForm);
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!editingCategory) setForm(emptyForm);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="terminal-panel flex flex-wrap items-end gap-3 p-4">
      <FormField label="Category Name" className="min-w-[220px] flex-1">
        <input
          required
          placeholder="Category Name"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="terminal-button">
          {editingCategory ? "Save Changes" : "Add Category"}
        </button>
        {editingCategory && (
          <button type="button" onClick={onCancelEdit} className="terminal-button-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
