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

function OrgCommandMenu() {
  const location = useLocation();
  const isActive = location.pathname.startsWith("/org");

  return (
    <div className="group relative">
      <button
        className={`text-sm font-medium uppercase tracking-wide ${
          isActive ? "text-term-amber" : "text-term-green/60 hover:text-term-green"
        }`}
      >
        Org Command
      </button>
      <div className="invisible absolute left-0 top-full z-10 min-w-[200px] border-2 border-term-amber bg-term-panel opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
        <NavLink to="/org/departments" className={dropdownLinkClass}>
          Departments
        </NavLink>
        <NavLink to="/org/users" className={dropdownLinkClass}>
          User Accounts
        </NavLink>
      </div>
    </div>
  );
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
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
            {user?.privilegeLevel === 0 && <OrgCommandMenu />}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-term-green/60">{user?.username}</span>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide ${
                isActive ? "text-term-amber" : "text-term-green/60 hover:text-term-green"
              }`
            }
          >
            <GearIcon />
            Settings
          </NavLink>
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
