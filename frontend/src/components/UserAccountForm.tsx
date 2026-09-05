import { useEffect, useState } from "react";
import type { CreateUserInput, Department, ManagedUser, UpdateUserInput } from "../types";
import { PRIVILEGE_LEVELS } from "../types";
import { FormField } from "./FormField";

interface UserAccountFormProps {
  departments: Department[];
  editingUser: ManagedUser | null;
  onCreate: (input: CreateUserInput) => Promise<void>;
  onUpdate: (id: number, input: UpdateUserInput) => Promise<void>;
  onCancelEdit: () => void;
}

interface FormState {
  userCode: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  privilegeLevel: number;
  departmentId: number | "";
}

const emptyForm: FormState = {
  userCode: "",
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  privilegeLevel: 2,
  departmentId: "",
};

export function UserAccountForm({ departments, editingUser, onCreate, onUpdate, onCancelEdit }: UserAccountFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(
      editingUser
        ? {
            userCode: editingUser.userCode,
            firstName: editingUser.firstName,
            lastName: editingUser.lastName,
            username: editingUser.username,
            password: "",
            privilegeLevel: editingUser.privilegeLevel,
            departmentId: editingUser.departmentId ?? "",
          }
        : emptyForm
    );
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const departmentId = form.departmentId === "" ? null : form.departmentId;
      if (editingUser) {
        await onUpdate(editingUser.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          privilegeLevel: form.privilegeLevel,
          departmentId,
        });
      } else {
        await onCreate({
          userCode: form.userCode,
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          password: form.password,
          privilegeLevel: form.privilegeLevel,
          departmentId,
        });
        setForm(emptyForm);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="terminal-panel grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
      <FormField label="User Code">
        <input
          required
          disabled={!!editingUser}
          placeholder="User Code"
          value={form.userCode}
          onChange={(e) => setForm({ ...form, userCode: e.target.value })}
          className="terminal-input disabled:opacity-50"
        />
      </FormField>
      <FormField label="First Name">
        <input
          required
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      <FormField label="Last Name">
        <input
          required
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      <FormField label="Username">
        <input
          required
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="terminal-input"
        />
      </FormField>
      {!editingUser && (
        <FormField label="Password">
          <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="terminal-input"
          />
        </FormField>
      )}
      <FormField label="Privilege Level">
        <select
          value={form.privilegeLevel}
          onChange={(e) => setForm({ ...form, privilegeLevel: Number(e.target.value) })}
          className="terminal-input"
        >
          {PRIVILEGE_LEVELS.map((p) => (
            <option key={p.value} value={p.value} className="bg-term-bg text-term-green">
              {p.label}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Department (optional)">
        <select
          value={form.departmentId}
          onChange={(e) => setForm({ ...form, departmentId: e.target.value ? Number(e.target.value) : "" })}
          className="terminal-input"
        >
          <option value="">No Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id} className="bg-term-bg text-term-green">
              {d.name}
            </option>
          ))}
        </select>
      </FormField>

      <div className="flex gap-2 sm:col-span-3">
        <button type="submit" disabled={submitting} className="terminal-button">
          {editingUser ? "Save Changes" : "Create User"}
        </button>
        {editingUser && (
          <button type="button" onClick={onCancelEdit} className="terminal-button-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
