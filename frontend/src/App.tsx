import { Routes, Route, Outlet } from "react-router-dom";
import { LoginPage } from "./components/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { WelcomePage } from "./components/WelcomePage";
import { ProductsPage } from "./components/ProductsPage";
import { CreateProductPage } from "./components/CreateProductPage";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { AttributeTemplatesPage } from "./components/AttributeTemplatesPage";
import { CategorizationPage } from "./components/CategorizationPage";
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
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<CreateProductPage />} />
          <Route path="/products/attribute-templates" element={<AttributeTemplatesPage />} />
          <Route path="/products/categorization" element={<CategorizationPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/sales-orders" element={<SalesOrdersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
