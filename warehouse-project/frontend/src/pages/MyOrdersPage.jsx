import OrderListPanel from "../components/features/orders/OrderListPanel";
import useOrders from "../hooks/useOrders";

export default function MyOrdersPage() {
  const state = useOrders({ mine: true });
  return <OrderListPanel state={state} mine />;
}
