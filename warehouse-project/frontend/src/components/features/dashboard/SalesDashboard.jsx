import { useMemo } from "react";
import { BadgeCheck, CircleDollarSign, Clock3, ShoppingCart } from "lucide-react";
import StatCard from "../../shared/StatCard";
import DashboardFrame from "./DashboardFrame";
import { RecentOrdersTable } from "./DashboardTables";
import useDashboard from "../../../hooks/useDashboard";
import { ROLES } from "../../../config/roles.js";

export default function SalesDashboard() {
  const state = useDashboard(ROLES.SALES);
  const { data } = state;
  const totals = useMemo(() => {
    const orders = data.orders ?? [];
    return {
      pending: orders.filter((order) => order?.status === "pending").length,
      completed: orders.filter((order) => order?.status === "delivered").length,
      sales: orders
        .filter((order) => order?.status !== "cancelled")
        .reduce((sum, order) => sum + Number(order?.totalAmount ?? 0), 0),
    };
  }, [data.orders]);
  const cards = [
    { label: "My orders", value: Number(data.orders?.length ?? 0).toLocaleString(), icon: ShoppingCart },
    { label: "Pending orders", value: totals.pending.toLocaleString(), icon: Clock3 },
    { label: "Completed orders", value: totals.completed.toLocaleString(), icon: BadgeCheck },
    { label: "Total sales amount", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totals.sales), icon: CircleDollarSign },
  ];
  return (
    <DashboardFrame title="Sales Dashboard" description="Your orders, recent activity, and order totals." state={state}>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Sales totals">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </section>
      <section className="mt-5">
        <RecentOrdersTable orders={data.orders} ordersPath="/my-orders" />
      </section>
    </DashboardFrame>
  );
}
