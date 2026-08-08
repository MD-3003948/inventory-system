import { useAuth } from "../context/AuthContext";

export function WelcomePage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.firstName}!</h1>
      <p className="mt-1 text-sm text-gray-500">
        {user?.organization} &middot; last login{" "}
        {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "N/A"}
      </p>

      <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
        Dashboard metrics (sales orders, revenue, top items, top customers) are coming in the
        next phase, once the sales/customer data model is built out.
      </div>
    </div>
  );
}
