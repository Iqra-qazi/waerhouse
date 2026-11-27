import OrderListPanel from "../components/features/orders/OrderListPanel";
import useOrders from "../hooks/useOrders";
import usePermissions from "../hooks/usePermissions";

export default function OrdersPage() {
  const state = useOrders();
  const { canManageOrders } = usePermissions();
  return <OrderListPanel state={state} canManageOrders={canManageOrders} />;
}
