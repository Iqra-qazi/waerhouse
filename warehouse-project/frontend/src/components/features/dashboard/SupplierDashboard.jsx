import { useMemo } from "react";
import { ClipboardList, Package, ThumbsDown, ThumbsUp, Timer } from "lucide-react";
import StatCard from "../../shared/StatCard";
import DashboardFrame from "./DashboardFrame";
import { RecentSupplyTable } from "./DashboardTables";
import { SupplyStatusChart } from "./DashboardCharts";
import useDashboard from "../../../hooks/useDashboard";
import { ROLES } from "../../../config/roles.js";

export default function SupplierDashboard() {
  const state = useDashboard(ROLES.SUPPLIER);
  const { data } = state;
  const counts = useMemo(() => ({
    pending: data.supplyRequests?.filter((entry) => entry?.status === "pending").length ?? 0,
    approved: data.supplyRequests?.filter((entry) => entry?.status === "approved").length ?? 0,
    rejected: data.supplyRequests?.filter((entry) => entry?.status === "rejected").length ?? 0,
  }), [data.supplyRequests]);
  const cards = [
    { label: "My products", value: Number(data.products?.length ?? 0).toLocaleString(), icon: Package },
    { label: "Supply requests", value: Number(data.supplyRequests?.length ?? 0).toLocaleString(), icon: ClipboardList },
    { label: "Pending", value: counts.pending.toLocaleString(), icon: Timer },
    { label: "Approved", value: counts.approved.toLocaleString(), icon: ThumbsUp },
    { label: "Rejected", value: counts.rejected.toLocaleString(), icon: ThumbsDown },
  ];
  return (
    <DashboardFrame title="Supplier Dashboard" description="Your product catalog and supply request activity." state={state}>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5" aria-label="Supplier totals">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </section>
      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <SupplyStatusChart requests={data.supplyRequests} />
        <RecentSupplyTable requests={data.supplyRequests} />
      </section>
    </DashboardFrame>
  );
}
