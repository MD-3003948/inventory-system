import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { dashboardApi, customersApi } from "../api";
import type { Customer, DashboardMetrics, RevenueSeries } from "../types";
import { RevenueChart } from "./RevenueChart";
import { FormField } from "./FormField";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type Timeframe = "1w" | "1m" | "6m" | "1y" | "custom";

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  "1w": "1 Week",
  "1m": "1 Month",
  "6m": "6 Months",
  "1y": "1 Year",
  custom: "Custom",
};

const TIMEFRAME_DAYS: Record<Exclude<Timeframe, "custom">, number> = {
  "1w": 7,
  "1m": 30,
  "6m": 182,
  "1y": 365,
};

const defaultFrom = toDateInputValue(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
const defaultTo = toDateInputValue(new Date());

export function WelcomePage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>("1m");
  const [customFrom, setCustomFrom] = useState(defaultFrom);
  const [customTo, setCustomTo] = useState(defaultTo);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [revenueSeries, setRevenueSeries] = useState<RevenueSeries | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      setMetrics(await dashboardApi.getMetrics());
      setError(null);
    } catch {
      setError("Could not load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  const loadRevenue = async () => {
    setRevenueLoading(true);
    try {
      const { fromDate, toDate } = timeframe === "custom"
        ? { fromDate: customFrom, toDate: customTo }
        : (() => {
            const days = TIMEFRAME_DAYS[timeframe];
            const to = new Date();
            const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
            return { fromDate: toDateInputValue(from), toDate: toDateInputValue(to) };
          })();

      const series = await dashboardApi.getRevenueSeries({
        fromDate: `${fromDate}T00:00:00.000Z`,
        toDate: `${toDate}T23:59:59.999Z`,
        customerId: customerId === "" ? undefined : customerId,
      });
      setRevenueSeries(series);
      setRevenueError(null);
    } catch {
      setRevenueError("Could not load revenue data.");
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    customersApi.list().then(setCustomers).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRevenue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, customerId, customFrom, customTo]);

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

            <div className="mt-3 flex flex-wrap items-end gap-2 text-xs text-term-green/60">
              <FormField label="Timeframe">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                  className="terminal-input py-1"
                >
                  {(Object.keys(TIMEFRAME_LABELS) as Timeframe[]).map((tf) => (
                    <option key={tf} value={tf}>
                      {TIMEFRAME_LABELS[tf]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Customer">
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="terminal-input py-1"
                >
                  <option value="">All Customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
              {timeframe === "custom" && (
                <>
                  <FormField label="From">
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="terminal-input py-1"
                    />
                  </FormField>
                  <FormField label="To">
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="terminal-input py-1"
                    />
                  </FormField>
                </>
              )}
            </div>

            {revenueError && <p className="mt-3 text-sm text-term-danger">{revenueError}</p>}
            {revenueLoading || !revenueSeries ? (
              <p className="mt-6 text-sm text-term-green/60">Loading revenue...</p>
            ) : (
              <>
                <p className="mt-3 text-3xl font-semibold">${revenueSeries.totalRevenue.toFixed(2)}</p>
                <RevenueChart series={revenueSeries} />
              </>
            )}

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
