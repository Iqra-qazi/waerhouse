import Badge from "../../ui/Badge";

const statusPresentation = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "primary" },
  shipped: { label: "Shipped", variant: "primary" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

export default function OrderStatusBadge({ status }) {
  const presentation = statusPresentation[String(status ?? "").toLowerCase()] ?? {
    label: status || "Unknown",
    variant: "neutral",
  };
  return <Badge variant={presentation.variant}>{presentation.label}</Badge>;
}
