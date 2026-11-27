import { useMemo } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Boxes, ClipboardList, PackageSearch, ShoppingCart } from "lucide-react";
import StatCard from "../../shared/StatCard";
import DashboardFrame from "./DashboardFrame";
import { LowStockTable, RecentOrdersTable } from "./DashboardTables";
import { StockByWarehouseChart, StockMovementChart } from "./DashboardCharts";
import useDashboard from "../../../hooks/useDashboard";
import { ROLES } from "../../../config/roles.js";

function todaysMovements(transactions = []) {
  const today = new Date().toDateString();
  return transactions.reduce((counts, entry) => {
    if (new Date(entry?.createdAt ?? "").toDateString() !== today) return counts;
    if (entry?.type === "IN") counts.in += Number(entry?.quantity ?? 0);
    if (entry?.type === "OUT") counts.out += Number(entry?.quantity ?? 0);
    return counts;
  }, { in: 0, out: 0 });
}

export default function ManagerDashboard() {
  const state = useDashboard(ROLES.MANAGER);
  const { data } = state;
  const today = useMemo(() => todaysMovements(data.transactions), [data.transactions]);
  const cards = [
    { label: "Stock units", value: Number(data.summary?.totalStockQuantity ?? 0).toLocaleString(), icon: Boxes },
    { label: "Low-stock records", value: Number(data.lowStock?.length ?? 0).toLocaleString(), icon: PackageSearch },
    { label: "Stock in today", value: today.in.toLocaleString(), icon: ArrowDownToLine },
    { label: "Stock out today", value: today.out.toLocaleString(), icon: ArrowUpFromLine },
    { label: "Pending orders", value: Number(data.orders?.filter((order) => order?.status === "pending").length ?? 0).toLocaleString(), icon: ShoppingCart },
    { label: "Pending supply requests", value: Number(data.supplyRequests?.filter((request) => request?.status === "pending").length ?? 0).toLocaleString(), icon: ClipboardList },
  ];

  return (
    <DashboardFrame title="Manager Dashboard" description="Inventory and fulfillment overview for warehouse operations." state={state}>
      <div role="alert" className="mb-5 rounded-xl border border-primary-300/20 bg-primary-300/10 px-4 py-3 text-sm text-primary-100">
        The backend dashboard and list endpoints currently return global totals and records to managers, not assigned-warehouse data. Values below reflect those API responses until backend scoping is added.
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Manager dashboard totals">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </section>
      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <StockByWarehouseChart stock={data.stock} />
        <StockMovementChart transactions={data.transactions} />
      </section>
      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
          <h2 className="px-4 py-4 text-sm font-semibold text-white sm:px-5">Low stock</h2>
          <LowStockTable entries={data.lowStock} />
        </div>
        <RecentOrdersTable orders={data.orders} />
      </section>
    </DashboardFrame>
  );
}
