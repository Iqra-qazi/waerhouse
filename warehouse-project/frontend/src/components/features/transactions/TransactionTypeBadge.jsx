import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import Badge from "../../ui/Badge";

export default function TransactionTypeBadge({ type }) {
  const value = String(type ?? "").toUpperCase();
  if (value === "IN" || value === "STOCK-IN") {
    return (
      <Badge variant="success" className="gap-1.5">
        <ArrowDownToLine size={13} aria-hidden="true" />
        Stock In
      </Badge>
    );
  }
  if (value === "OUT" || value === "STOCK-OUT") {
    return (
      <Badge variant="danger" className="gap-1.5">
        <ArrowUpFromLine size={13} aria-hidden="true" />
        Stock Out
      </Badge>
    );
  }
  return <Badge>{value || "Unknown"}</Badge>;
}
