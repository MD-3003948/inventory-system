import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium uppercase tracking-wide ${isActive ? "text-term-amber" : "text-term-green/60 hover:text-term-green"}`;

const dropdownLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2 text-sm uppercase tracking-wide ${
    isActive ? "bg-term-bg text-term-amber" : "text-term-green/80 hover:bg-term-bg hover:text-term-green"
  }`;

function ProductManagementMenu() {
  const location = useLocation();
  const isActive = location.pathname.startsWith("/products");

  return (
    <div className="group relative">
      <button
        className={`text-sm font-medium uppercase tracking-wide ${
          isActive ? "text-term-amber" : "text-term-green/60 hover:text-term-green"
        }`}
      >
        Product Management
      </button>
      <div className="invisible absolute left-0 top-full z-10 min-w-[200px] border-2 border-term-amber bg-term-panel opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
        <NavLink to="/products" end className={dropdownLinkClass}>
          Products
        </NavLink>
        <NavLink to="/products/new" className={dropdownLinkClass}>
          Create New
        </NavLink>
        <NavLink to="/products/attribute-templates" className={dropdownLinkClass}>
          Attribute Templates
        </NavLink>
        <NavLink to="/products/categorization" className={dropdownLinkClass}>
          Categorization
        </NavLink>
      </div>
    </div>
  );
}

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b-4 border-double border-term-amber bg-term-panel">
      <div className="mx-auto flex w-[95%] items-center justify-between py-3">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-3xl font-bold uppercase tracking-wide text-term-green">
            XELP
          </Link>
          <div className="flex items-center gap-6">
            <ProductManagementMenu />
            <NavLink to="/customers" className={linkClass}>
              Customers
            </NavLink>
            <NavLink to="/sales-orders" className={linkClass}>
              Sales Orders
            </NavLink>
          </div>
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
