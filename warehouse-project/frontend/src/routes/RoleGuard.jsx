import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [];

  if (!roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
}
