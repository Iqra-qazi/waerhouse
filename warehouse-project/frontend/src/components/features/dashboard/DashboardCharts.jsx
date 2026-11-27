import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "../../ui/EmptyState";

const colors = ["#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#60a5fa"];
const axisStyle = { fill: "#94a3b8", fontSize: 11 };

function ChartPanel({ title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-surface p-4 sm:p-5 ${className}`}>
      <h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

export function OrdersByStatusChart({ orders = [] }) {
  const data = useMemo(() => {
    const counts = new Map();
    orders.forEach((order) => {
      const status = String(order?.status ?? "unknown");
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });
    return [...counts].map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [orders]);
  return (
    <ChartPanel title="Orders by status">
      {data.length ? (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={3}>
              {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#151021", border: "1px solid #ffffff20", borderRadius: 12 }} />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      ) : <EmptyState title="No orders yet" description="Order status data will appear when orders exist." />}
    </ChartPanel>
  );
}

export function StockByWarehouseChart({ stock = [] }) {
  const data = useMemo(() => {
    const quantities = new Map();
    stock.forEach((entry) => {
      const warehouse = entry?.warehouse;
      const name = typeof warehouse === "object"
        ? warehouse?.name ?? warehouse?.code ?? "Warehouse"
        : String(warehouse ?? "Warehouse");
      quantities.set(name, (quantities.get(name) ?? 0) + Number(entry?.quantity ?? 0));
    });
    return [...quantities].map(([name, quantity]) => ({ name, quantity }));
  }, [stock]);
  return (
    <ChartPanel title="Stock by warehouse">
      {data.length ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ left: -16, right: 12 }}>
            <CartesianGrid stroke="#ffffff12" vertical={false} />
            <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#151021", border: "1px solid #ffffff20", borderRadius: 12 }} />
            <Bar dataKey="quantity" name="Units" fill="#a78bfa" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : <EmptyState title="No stock records" description="Warehouse stock data is not available yet." />}
    </ChartPanel>
  );
}

export function StockMovementChart({ transactions = [] }) {
  const [days, setDays] = useState(7);
  const data = useMemo(() => {
    const relevant = transactions.filter((entry) => ["IN", "OUT"].includes(String(entry?.type ?? "").toUpperCase()));
    if (!relevant.length) return [];
    const now = new Date();
    const dayKeys = Array.from({ length: days }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (days - index - 1));
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return { key, label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }), stockIn: 0, stockOut: 0 };
    });
    const byDate = new Map(dayKeys.map((entry) => [entry.key, entry]));
    relevant.forEach((entry) => {
      const date = new Date(entry?.createdAt ?? "");
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const target = byDate.get(key);
      if (!target) return;
      if (String(entry.type).toUpperCase() === "IN") target.stockIn += Number(entry.quantity ?? 0);
      else target.stockOut += Number(entry.quantity ?? 0);
    });
    return dayKeys;
  }, [days, transactions]);
  return (
    <ChartPanel title="Stock in vs. out">
      <div className="mb-3 flex justify-end gap-2">
        {[7, 30].map((period) => (
          <button key={period} type="button" aria-pressed={days === period} onClick={() => setDays(period)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${days === period ? "bg-primary-500/20 text-primary-200" : "text-slate-400 hover:bg-white/5"}`}>
            {period} days
          </button>
        ))}
      </div>
      {data.length ? (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ left: -18, right: 10 }}>
            <CartesianGrid stroke="#ffffff12" vertical={false} />
            <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#151021", border: "1px solid #ffffff20", borderRadius: 12 }} />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
            <Area type="monotone" dataKey="stockIn" name="Stock In" stroke="#34d399" fill="#34d39925" />
            <Area type="monotone" dataKey="stockOut" name="Stock Out" stroke="#fb7185" fill="#fb718525" />
          </AreaChart>
        </ResponsiveContainer>
      ) : <EmptyState title="No stock movements" description="Movement trends will appear when stock transactions are recorded." />}
    </ChartPanel>
  );
}

export function SupplyStatusChart({ requests = [] }) {
  const data = useMemo(() => {
    const counts = new Map();
    requests.forEach((request) => {
      const status = String(request?.status ?? "unknown");
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });
    return [...counts].map(([name, value]) => ({ name, value }));
  }, [requests]);
  return (
    <ChartPanel title="Supply requests by status">
      {data.length ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={3}>
              {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#151021", border: "1px solid #ffffff20", borderRadius: 12 }} />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      ) : <EmptyState title="No supply requests" description="Request status data will appear when requests exist." />}
    </ChartPanel>
  );
}
