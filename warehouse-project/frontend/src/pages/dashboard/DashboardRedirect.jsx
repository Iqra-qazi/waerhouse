import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../config/roles.js";
import Skeleton from "../../components/ui/Skeleton";

const AdminDashboard = lazy(() => import("../../components/features/dashboard/AdminDashboard"));
const ManagerDashboard = lazy(() => import("../../components/features/dashboard/ManagerDashboard"));
const SupplierDashboard = lazy(() => import("../../components/features/dashboard/SupplierDashboard"));
const SalesDashboard = lazy(() => import("../../components/features/dashboard/SalesDashboard"));

const dashboardsByRole = {
  [ROLES.ADMIN]: AdminDashboard,
  [ROLES.MANAGER]: ManagerDashboard,
  [ROLES.SUPPLIER]: SupplierDashboard,
  [ROLES.SALES]: SalesDashboard,
};

export default function DashboardRedirect() {
  const { user } = useAuth();
  const Dashboard = dashboardsByRole[user?.role];
  if (!Dashboard) return <Navigate to="/unauthorized" replace />;
  return (
    <Suspense fallback={
      <div className="space-y-5" aria-label="Loading dashboard">
        <Skeleton className="h-10 w-60" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
}
