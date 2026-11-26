import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginRoute from "./routes/LoginRoute";
import SignupPage from "./pages/auth/Register";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import { appRoles } from "./config/navigation";
import RoleGuard from "./routes/RoleGuard";
import DashboardRedirect from "./pages/dashboard/DashboardRedirect";
import PlaceholderPage from "./pages/PlaceholderPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";
import UsersPage from "./pages/UsersPage";
import WarehousesPage from "./pages/WarehousesPage";
import ProductsPage from "./pages/ProductsPage";
import StockPage from "./pages/StockPage";
import StockTransactionsPage from "./pages/StockTransactionsPage";
import { ROLES } from "./config/roles.js";

const placeholderRoutes = [
  { path: "orders", roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { path: "orders/create", roles: [ROLES.SALES] },
  { path: "orders/my", roles: [ROLES.SALES] },
  { path: "supply-requests", roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPLIER] },
  { path: "reports", roles: [ROLES.ADMIN] },
];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route
              path="dashboard"
              element={
                <RoleGuard allowedRoles={appRoles}>
                  <DashboardRedirect />
                </RoleGuard>
              }
            />
            <Route
              path="users"
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                  <UsersPage />
                </RoleGuard>
              }
            />
            <Route
              path="warehouses"
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                  <WarehousesPage />
                </RoleGuard>
              }
            />
            <Route
              path="products"
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES]}>
                  <ProductsPage />
                </RoleGuard>
              }
            />
            <Route
              path="stock"
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                  <StockPage />
                </RoleGuard>
              }
            />
            <Route
              path="stock-transactions"
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                  <StockTransactionsPage />
                </RoleGuard>
              }
            />
            {placeholderRoutes.map(({ path, roles }) => (
              <Route
                key={path}
                path={path}
                element={
                  <RoleGuard allowedRoles={roles}>
                    <PlaceholderPage />
                  </RoleGuard>
                }
              />
            ))}
            <Route
              path="profile"
              element={
                <RoleGuard allowedRoles={appRoles}>
                  <PlaceholderPage title="Profile" />
                </RoleGuard>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "var(--color-surface)",
            color: "var(--color-foreground)",
            border: "1px solid rgb(255 255 255 / 0.1)",
            boxShadow:
              "0 12px 40px color-mix(in srgb, var(--color-primary-600) 18%, transparent)",
          },
          success: {
            iconTheme: {
              primary: "var(--color-primary-400)",
              secondary: "var(--color-surface)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--color-error)",
              secondary: "var(--color-surface)",
            },
          },
        }}
      />
    </BrowserRouter>
  );
}