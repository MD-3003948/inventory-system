import { Routes, Route, Outlet } from "react-router-dom";
import { LoginPage } from "./components/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { WelcomePage } from "./components/WelcomePage";
import { InventoryPage } from "./components/InventoryPage";
import { CustomersPage } from "./components/CustomersPage";
import { SalesOrdersPage } from "./components/SalesOrdersPage";
import { NavBar } from "./components/NavBar";

function AuthenticatedLayout() {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/sales-orders" element={<SalesOrdersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
