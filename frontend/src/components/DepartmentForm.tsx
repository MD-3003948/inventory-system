import { useEffect, useState } from "react";
import type { Department, DepartmentInput } from "../types";
import { FormField } from "./FormField";

const emptyForm: DepartmentInput = { name: "" };

interface DepartmentFormProps {
  editingDepartment: Department | null;
  onSubmit: (input: DepartmentInput) => Promise<void>;
  onCancelEdit: () => void;
}

export function DepartmentForm({ editingDepartment, onSubmit, onCancelEdit }: DepartmentFormProps) {
  const [form, setForm] = useState<DepartmentInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(editingDepartment ? { name: editingDepartment.name } : emptyForm);
  }, [editingDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!editingDepartment) setForm(emptyForm);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="terminal-panel flex flex-wrap items-end gap-3 p-4">
      <FormField label="Department Name" className="min-w-[220px] flex-1">
        <input
          required
          placeholder="Department Name"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="terminal-button">
          {editingDepartment ? "Save Changes" : "Add Department"}
        </button>
        {editingDepartment && (
          <button type="button" onClick={onCancelEdit} className="terminal-button-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
