import { useEffect, useState } from "react";
import { salesOrdersApi } from "../api";
import { SalesOrderForm } from "./SalesOrderForm";
import { SALES_ORDER_STATUSES } from "../types";
import type { SalesOrder, SalesOrderInput, SalesOrderStatus } from "../types";

export function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      setOrders(await salesOrdersApi.list());
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCreate = async (order: SalesOrderInput) => {
    await salesOrdersApi.create(order);
    await loadOrders();
  };

  const handleStatusChange = async (id: number, status: SalesOrderStatus) => {
    await salesOrdersApi.updateStatus(id, status);
    await loadOrders();
  };

  const handleDelete = async (id: number) => {
    await salesOrdersApi.remove(id);
    await loadOrders();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Sales Orders</h1>
      <p className="mt-1 text-sm text-gray-500">Create and track customer orders.</p>

      <div className="mt-6">
        <SalesOrderForm onSubmit={handleCreate} />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No orders yet. Create one above.</p>
      ) : (
        <table className="mt-6 w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2">Order #</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-gray-200">
                <td className="px-4 py-2 font-medium text-gray-900">{o.orderNumber}</td>
                <td className="px-4 py-2 text-gray-600">{o.customerName}</td>
                <td className="px-4 py-2 text-gray-600">{new Date(o.orderDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value as SalesOrderStatus)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    {SALES_ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-right text-gray-600">${o.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => handleDelete(o.id)} className="text-red-600 hover:underline">
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
