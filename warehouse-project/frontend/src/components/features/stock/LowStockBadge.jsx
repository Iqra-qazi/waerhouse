import Badge from "../../ui/Badge";

export function getStockStatus(quantity, threshold) {
  const available = Number(quantity ?? 0);
  if (available <= 0) return "out";
  if (available <= Number(threshold ?? 10)) return "low";
  return "in";
}

export default function LowStockBadge({ quantity, threshold }) {
  const status = getStockStatus(quantity, threshold);
  if (status === "out") return <Badge variant="danger">Out of Stock</Badge>;
  if (status === "low") return <Badge variant="warning">Low Stock</Badge>;
  return <Badge variant="success">In Stock</Badge>;
}
