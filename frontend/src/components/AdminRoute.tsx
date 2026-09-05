import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute() {
  const { user } = useAuth();

  if (user?.privilegeLevel !== 0) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
