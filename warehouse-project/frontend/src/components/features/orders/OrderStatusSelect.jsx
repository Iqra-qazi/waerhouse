import { useState } from "react";
import { Check } from "lucide-react";
import Select from "../../ui/Select";
import Spinner from "../../ui/Spinner";

export const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrderStatusSelect({ order, onChange, disabled = false }) {
  const [nextStatus, setNextStatus] = useState(order?.status ?? "pending");
  const [saving, setSaving] = useState(false);

  async function saveStatus() {
    if (!nextStatus || nextStatus === order?.status) return;
    setSaving(true);
    try {
      if (await onChange(order, nextStatus)) setNextStatus(nextStatus);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-w-48 items-center gap-2">
      <Select
        aria-label={`New status for ${order?.orderNumber ?? "order"}`}
        value={nextStatus}
        onChange={(event) => setNextStatus(event.target.value)}
        options={ORDER_STATUSES}
        disabled={disabled || saving}
        className="min-w-0 flex-1"
      />
      <button
        type="button"
        onClick={saveStatus}
        disabled={disabled || saving || nextStatus === order?.status}
        title="Save status"
        aria-label={`Save status for ${order?.orderNumber ?? "order"}`}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-400/20 text-primary-200 transition hover:bg-primary-500/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? <Spinner size={3.5} /> : <Check size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}
