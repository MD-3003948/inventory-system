import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { dashboardApi } from "../api";
import type { DashboardMetrics } from "../types";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const defaultFrom = toDateInputValue(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
const defaultTo = toDateInputValue(new Date());

export function WelcomePage() {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      setMetrics(await dashboardApi.getMetrics(fromDate, toDate));
      setError(null);
    } catch {
      setError("Could not load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.firstName}!</h1>
      <p className="mt-1 text-sm text-gray-500">
        {user?.organization} &middot; last login{" "}
        {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "N/A"}
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading || !metrics ? (
        <p className="mt-6 text-sm text-gray-500">Loading dashboard...</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Sales Orders In Progress</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {metrics.salesOrdersInProgress}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                ${metrics.revenueInRange.toFixed(2)}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadMetrics();
                }}
                className="mt-3 flex items-center gap-2 text-xs text-gray-500"
              >
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1"
                />
                <span>to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1"
                />
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-medium text-gray-900">Most Popular Items</h2>
              {metrics.topItems.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">No sales yet.</p>
              ) : (
                <table className="mt-3 w-full text-left text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="py-1">Item</th>
                      <th className="py-1 text-right">Sold</th>
                      <th className="py-1 text-right">In Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topItems.map((item) => (
                      <tr key={item.inventoryItemId} className="border-t border-gray-100">
                        <td className="py-1.5 text-gray-900">{item.name}</td>
                        <td className="py-1.5 text-right text-gray-600">{item.quantitySold}</td>
                        <td className="py-1.5 text-right text-gray-600">{item.currentStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-medium text-gray-900">Most Active Customers</h2>
              {metrics.topCustomers.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">No customers with orders yet.</p>
              ) : (
                <table className="mt-3 w-full text-left text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="py-1">Customer</th>
                      <th className="py-1 text-right">Orders</th>
                      <th className="py-1 text-right">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topCustomers.map((c) => (
                      <tr key={c.customerId} className="border-t border-gray-100">
                        <td className="py-1.5 text-gray-900">{c.name}</td>
                        <td className="py-1.5 text-right text-gray-600">{c.orderCount}</td>
                        <td className="py-1.5 text-right text-gray-600">${c.totalSpend.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
