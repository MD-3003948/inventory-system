import { useEffect, useState } from "react";
import { departmentsApi, ApiError } from "../api";
import { DepartmentForm } from "./DepartmentForm";
import type { Department, DepartmentInput } from "../types";

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      setDepartments(await departmentsApi.list());
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSubmit = async (input: DepartmentInput) => {
    setError(null);
    try {
      if (editingDepartment) {
        await departmentsApi.update(editingDepartment.id, input);
        setEditingDepartment(null);
      } else {
        await departmentsApi.create(input);
      }
      await loadDepartments();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the department.");
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await departmentsApi.remove(id);
      await loadDepartments();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the department.");
    }
  };

  return (
    <div className="mx-auto w-[95%] py-10">
      <h1 className="text-2xl font-semibold">Departments</h1>
      <p className="mt-1 text-sm text-term-green/60">Manage your organization's departments.</p>

      <div className="mt-6">
        <DepartmentForm
          editingDepartment={editingDepartment}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingDepartment(null)}
        />
      </div>

      {error && <p className="mt-4 text-sm text-term-danger">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm text-term-green/60">Loading...</p>
      ) : departments.length === 0 ? (
        <p className="mt-6 text-sm text-term-green/60">No departments yet. Add one above.</p>
      ) : (
        <table className="mt-6 w-full border-collapse border-2 border-term-amber text-left text-sm">
          <thead className="bg-term-panel text-term-amber">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2 text-right">Members</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id} className="border-t border-term-amber/30">
                <td className="px-4 py-2 font-medium">{d.name}</td>
                <td className="px-4 py-2 text-right text-term-green/70">{d.userCount}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => setEditingDepartment(d)} className="mr-3 text-term-amber hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="text-term-danger hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
