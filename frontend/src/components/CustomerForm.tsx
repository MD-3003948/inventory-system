import { useEffect, useState } from "react";
import type { Customer, CustomerInput } from "../types";
import { FormField } from "./FormField";

const emptyForm: CustomerInput = { name: "", email: "", phone: "", company: "" };

interface CustomerFormProps {
  editingCustomer: Customer | null;
  onSubmit: (customer: CustomerInput) => Promise<void>;
  onCancelEdit: () => void;
}

export function CustomerForm({ editingCustomer, onSubmit, onCancelEdit }: CustomerFormProps) {
  const [form, setForm] = useState<CustomerInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(editingCustomer ? { ...editingCustomer } : emptyForm);
  }, [editingCustomer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!editingCustomer) setForm(emptyForm);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="terminal-panel grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
      <FormField label="Name">
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      <FormField label="Email">
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      <FormField label="Phone">
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      <FormField label="Company">
        <input
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      <div className="col-span-2 flex gap-2 sm:col-span-4">
        <button type="submit" disabled={submitting} className="terminal-button">
          {editingCustomer ? "Save Changes" : "Add Customer"}
        </button>
        {editingCustomer && (
          <button type="button" onClick={onCancelEdit} className="terminal-button-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
