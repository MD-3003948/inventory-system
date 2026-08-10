import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium uppercase tracking-wide ${isActive ? "text-term-amber" : "text-term-green/60 hover:text-term-green"}`;

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b-4 border-double border-term-amber bg-term-panel">
      <div className="mx-auto flex w-[95%] items-center justify-between py-3">
        <div className="flex gap-6">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/inventory" className={linkClass}>
            Inventory
          </NavLink>
          <NavLink to="/customers" className={linkClass}>
            Customers
          </NavLink>
          <NavLink to="/sales-orders" className={linkClass}>
            Sales Orders
          </NavLink>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-term-green/60">{user?.username}</span>
          <button
            onClick={logout}
            className="text-sm font-medium uppercase tracking-wide text-term-green/60 hover:text-term-amber"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
