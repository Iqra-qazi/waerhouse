import api from "./api.js";

function getResponseData(response) {
  return response?.data?.data ?? response?.data;
}

function getOrderList(response, endpoint) {
  const orders = getResponseData(response);
  if (!Array.isArray(orders)) {
    throw new Error(`The ${endpoint} endpoint returned an invalid response.`);
  }
  return orders;
}

export async function getOrders() {
  return getOrderList(await api.get("/orders"), "orders");
}

export async function getMyOrders() {
  return getOrderList(await api.get("/orders/my"), "my orders");
}

export async function getOrder(id) {
  return getResponseData(await api.get(`/orders/${encodeURIComponent(id)}`));
}

export async function createOrder(payload) {
  return getResponseData(await api.post("/orders", payload));
}

export async function updateOrderStatus(id, status) {
  return getResponseData(
    await api.patch(`/orders/${encodeURIComponent(id)}/status`, { status }),
  );
}

export async function cancelOrder(id) {
  return getResponseData(await api.patch(`/orders/${encodeURIComponent(id)}/cancel`));
}

export default {
  getOrders,
  getMyOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
};
