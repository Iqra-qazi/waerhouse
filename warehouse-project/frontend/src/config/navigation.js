import {
  ArrowDownToLine,
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  ListOrdered,
  Package,
  Plus,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { ROLES } from "./roles.js";

const navigation = {
  [ROLES.ADMIN]: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Users", path: "/users", icon: Users },
    { label: "Warehouses", path: "/warehouses", icon: Warehouse },
    { label: "Products", path: "/products", icon: Package },
    { label: "Stock", path: "/stock", icon: Boxes },
    { label: "Orders", path: "/orders", icon: ShoppingCart },
    { label: "Supply Requests", path: "/supply-requests", icon: ClipboardList },
    { label: "Reports", path: "/reports", icon: ChartNoAxesCombined },
  ],
  [ROLES.MANAGER]: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "My Warehouses", path: "/warehouses", icon: Warehouse },
    { label: "Products", path: "/products", icon: Package },
    { label: "Stock", path: "/stock", icon: Boxes },
    { label: "Stock Transactions", path: "/stock-transactions", icon: ArrowDownToLine },
    { label: "Orders", path: "/orders", icon: ShoppingCart },
    { label: "Supply Requests", path: "/supply-requests", icon: ClipboardList },
  ],
  [ROLES.SUPPLIER]: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Supply Requests", path: "/supply-requests", icon: Truck },
  ],
  [ROLES.SALES]: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Products", path: "/products", icon: Package },
    { label: "Create Order", path: "/orders/create", icon: Plus },
    { label: "My Orders", path: "/orders/my", icon: ListOrdered },
  ],
};

export const navigationByRole = navigation;
export const appRoles = Object.values(ROLES);
