import { useEffect, useState } from "react";
import { customersApi } from "../api";
import { CustomerForm } from "./CustomerForm";
import type { Customer, CustomerInput } from "../types";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      setCustomers(await customersApi.list());
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async (input: CustomerInput) => {
    if (editingCustomer) {
      await customersApi.update(editingCustomer.id, input);
      setEditingCustomer(null);
    } else {
      await customersApi.create(input);
    }
    await loadCustomers();
  };

  const handleDelete = async (id: number) => {
    await customersApi.remove(id);
    await loadCustomers();
  };

  return (
    <div className="mx-auto w-[95%] py-10">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <p className="mt-1 text-sm text-term-green/60">Manage customer accounts.</p>

      <div className="mt-6">
        <CustomerForm
          editingCustomer={editingCustomer}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingCustomer(null)}
        />
      </div>

      {error && <p className="mt-4 text-sm text-term-danger">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm text-term-green/60">Loading...</p>
      ) : customers.length === 0 ? (
        <p className="mt-6 text-sm text-term-green/60">No customers yet. Add one above.</p>
      ) : (
        <table className="mt-6 w-full border-collapse border-2 border-term-amber text-left text-sm">
          <thead className="bg-term-panel text-term-amber">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Company</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-term-amber/30">
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-term-green/70">{c.company}</td>
                <td className="px-4 py-2 text-term-green/70">{c.email}</td>
                <td className="px-4 py-2 text-term-green/70">{c.phone}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => setEditingCustomer(c)} className="mr-3 text-term-amber hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-term-danger hover:underline">
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
