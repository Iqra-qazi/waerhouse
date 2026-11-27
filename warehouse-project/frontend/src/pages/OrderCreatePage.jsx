import { useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import OrderForm from "../components/features/orders/OrderForm";
import useOrderForm from "../hooks/useOrderForm";

export default function OrderCreatePage() {
  const state = useOrderForm();
  const navigate = useNavigate();

  async function submitOrder(payload) {
    await state.createOrder(payload);
    navigate("/my-orders", { replace: true });
  }

  return (
    <>
      <PageHeader title="Create Order" description="Choose a warehouse and products for your order." />
      <OrderForm
        products={state.products}
        warehouses={state.warehouses}
        loading={state.loading}
        error={state.error}
        onRetry={state.retry}
        onSubmit={submitOrder}
      />
    </>
  );
}
