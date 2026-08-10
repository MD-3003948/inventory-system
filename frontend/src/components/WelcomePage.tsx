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
    <div className="mx-auto w-[95%] py-10">
      <h1 className="text-2xl font-semibold">Welcome, {user?.firstName}!</h1>
      <p className="mt-1 text-sm text-term-green/60">
        {user?.organization} &middot; last login{" "}
        {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "N/A"}
      </p>

      {error && <p className="mt-4 text-sm text-term-danger">{error}</p>}
      {loading || !metrics ? (
        <p className="mt-6 text-sm text-term-green/60">Loading dashboard...</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Left half: Revenue on top, Most Active Customers below, one combined block */}
          <div className="terminal-panel flex flex-col p-5">
            <p className="text-sm uppercase tracking-wide text-term-amber">Revenue</p>
            <p className="mt-1 text-3xl font-semibold">${metrics.revenueInRange.toFixed(2)}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadMetrics();
              }}
              className="mt-3 flex items-center gap-2 text-xs text-term-green/60"
            >
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="terminal-input py-1"
              />
              <span>to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="terminal-input py-1"
              />
              <button type="submit" className="terminal-button px-3 py-1 text-xs">
                Apply
              </button>
            </form>

            <div className="mt-6 border-t-2 border-term-amber/30 pt-4">
              <h2 className="text-sm">Most Active Customers</h2>
              {metrics.topCustomers.length === 0 ? (
                <p className="mt-3 text-sm text-term-green/60">No customers with orders yet.</p>
              ) : (
                <table className="mt-3 w-full text-left text-sm">
                  <thead className="text-term-amber">
                    <tr>
                      <th className="py-1">Customer</th>
                      <th className="py-1 text-right">Orders</th>
                      <th className="py-1 text-right">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topCustomers.map((c) => (
                      <tr key={c.customerId} className="border-t border-term-amber/30">
                        <td className="py-1.5">{c.name}</td>
                        <td className="py-1.5 text-right text-term-green/70">{c.orderCount}</td>
                        <td className="py-1.5 text-right text-term-green/70">${c.totalSpend.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right half: In-progress orders + per-customer active order counts, then top 3 items below */}
          <div className="flex flex-col gap-4">
            <div className="terminal-panel p-5">
              <p className="text-sm uppercase tracking-wide text-term-amber">Sales Orders In Progress</p>
              <p className="mt-1 text-3xl font-semibold">{metrics.salesOrdersInProgress}</p>

              <div className="mt-4 border-t-2 border-term-amber/30 pt-4">
                <h2 className="text-sm">Customers With Active Orders</h2>
                {metrics.activeCustomerOrders.length === 0 ? (
                  <p className="mt-3 text-sm text-term-green/60">No active orders right now.</p>
                ) : (
                  <table className="mt-3 w-full text-left text-sm">
                    <thead className="text-term-amber">
                      <tr>
                        <th className="py-1">Customer</th>
                        <th className="py-1 text-right">Active Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.activeCustomerOrders.map((c) => (
                        <tr key={c.customerId} className="border-t border-term-amber/30">
                          <td className="py-1.5">{c.name}</td>
                          <td className="py-1.5 text-right text-term-green/70">{c.activeOrderCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="terminal-panel p-5">
              <h2 className="text-sm">Most Popular Items (Top 3)</h2>
              {metrics.topItems.length === 0 ? (
                <p className="mt-3 text-sm text-term-green/60">No sales yet.</p>
              ) : (
                <table className="mt-3 w-full text-left text-sm">
                  <thead className="text-term-amber">
                    <tr>
                      <th className="py-1">Item</th>
                      <th className="py-1 text-right">Sold</th>
                      <th className="py-1 text-right">In Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topItems.map((item) => (
                      <tr key={item.productId} className="border-t border-term-amber/30">
                        <td className="py-1.5">{item.name}</td>
                        <td className="py-1.5 text-right text-term-green/70">{item.quantitySold}</td>
                        <td className="py-1.5 text-right text-term-green/70">{item.currentStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
