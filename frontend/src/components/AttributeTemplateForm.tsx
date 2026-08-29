import { useEffect, useState } from "react";
import type { AttributeTemplate, AttributeTemplateInput } from "../types";
import { FormField } from "./FormField";

const emptyForm: AttributeTemplateInput = { name: "" };

interface AttributeTemplateFormProps {
  editingTemplate: AttributeTemplate | null;
  onSubmit: (input: AttributeTemplateInput) => Promise<void>;
  onCancelEdit: () => void;
}

export function AttributeTemplateForm({ editingTemplate, onSubmit, onCancelEdit }: AttributeTemplateFormProps) {
  const [form, setForm] = useState<AttributeTemplateInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(editingTemplate ? { name: editingTemplate.name } : emptyForm);
  }, [editingTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!editingTemplate) setForm(emptyForm);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="terminal-panel flex flex-wrap items-end gap-3 p-4">
      <FormField label="Template Name" className="min-w-[220px] flex-1">
        <input
          required
          placeholder="Template Name"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="terminal-button">
          {editingTemplate ? "Save Changes" : "Add Template"}
        </button>
        {editingTemplate && (
          <button type="button" onClick={onCancelEdit} className="terminal-button-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
