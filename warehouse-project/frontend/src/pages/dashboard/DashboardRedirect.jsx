import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../config/roles.js";

export function AdminDashboard() {
  return <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>;
}

export function ManagerDashboard() {
  return <h1 className="text-2xl font-bold text-white">Manager Dashboard</h1>;
}

export function SupplierDashboard() {
  return <h1 className="text-2xl font-bold text-white">Supplier Dashboard</h1>;
}

export function SalesDashboard() {
  return <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>;
}

const dashboardsByRole = {
  [ROLES.ADMIN]: AdminDashboard,
  [ROLES.MANAGER]: ManagerDashboard,
  [ROLES.SUPPLIER]: SupplierDashboard,
  [ROLES.SALES]: SalesDashboard,
};

export default function DashboardRedirect() {
  const { user } = useAuth();
  const Dashboard = dashboardsByRole[user?.role];
  return Dashboard ? <Dashboard /> : <Navigate to="/unauthorized" replace />;
}
