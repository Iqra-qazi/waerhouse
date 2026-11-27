import { Boxes, Package, ShoppingCart, TriangleAlert, Users, Warehouse } from "lucide-react";
import StatCard from "../../shared/StatCard";
import { OrdersByStatusChart, StockByWarehouseChart, StockMovementChart } from "./DashboardCharts";
import DashboardFrame from "./DashboardFrame";
import { RecentOrdersTable, RecentTransactionsTable } from "./DashboardTables";
import useDashboard from "../../../hooks/useDashboard";
import { ROLES } from "../../../config/roles.js";

function number(value) {
  return Number(value ?? 0).toLocaleString();
}

export default function AdminDashboard() {
  const state = useDashboard(ROLES.ADMIN);
  const { data } = state;
  const stats = data.summary ?? {};
  const cards = [
    { label: "Active users", value: number(stats.users ?? data.users?.filter((user) => user?.isActive !== false).length), icon: Users },
    { label: "Warehouses", value: number(data.warehouses?.length), icon: Warehouse },
    { label: "Products", value: number(data.products?.length), icon: Package },
    { label: "Orders", value: number(stats.orders ?? data.orders?.length), icon: ShoppingCart },
    { label: "Low-stock records", value: number(data.lowStock?.length), icon: TriangleAlert },
    { label: "Total stock units", value: number(stats.totalStockQuantity), icon: Boxes },
  ];

  return (
    <DashboardFrame title="Admin Dashboard" description="A real-time overview of warehouse operations." state={state}>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Admin totals">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </section>
      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <OrdersByStatusChart orders={data.orders} />
        <StockByWarehouseChart stock={data.stock} />
        <StockMovementChart transactions={data.transactions} />
      </section>
      <section className="mt-5 grid gap-4 2xl:grid-cols-2">
        <RecentOrdersTable orders={data.orders} />
        <RecentTransactionsTable transactions={data.transactions} />
      </section>
    </DashboardFrame>
  );
}
