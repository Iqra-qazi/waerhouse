import Badge from "../../ui/Badge";

const statuses = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
};

export default function SupplyStatusBadge({ status }) {
  const result = statuses[String(status ?? "").toLowerCase()] ?? {
    label: status || "Unknown",
    variant: "neutral",
  };
  return <Badge variant={result.variant}>{result.label}</Badge>;
}
