import { useAuth } from "../context/AuthContext";
import { ROLES } from "../config/roles.js";

export default function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    canManageProducts: role === ROLES.ADMIN,
    canViewProductStock: role === ROLES.ADMIN || role === ROLES.MANAGER,
    canManageStock: role === ROLES.ADMIN || role === ROLES.MANAGER,
    canManageOrders: role === ROLES.ADMIN || role === ROLES.MANAGER,
    canCreateOrder: role === ROLES.SALES,
    canReviewSupplyRequests: role === ROLES.ADMIN || role === ROLES.MANAGER,
    canCreateSupplyRequest: role === ROLES.SUPPLIER,
    canViewReports: role === ROLES.ADMIN || role === ROLES.MANAGER,
  };
}
