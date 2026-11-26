import api from "./api.js";

function getResponseData(response) {
  return response?.data?.data ?? response?.data;
}

export async function getWarehouses() {
  const response = await api.get("/warehouses");
  const warehouses = getResponseData(response);
  if (!Array.isArray(warehouses)) {
    throw new Error("The warehouses endpoint returned an invalid response.");
  }
  return warehouses;
}

export async function getWarehouse(id) {
  const response = await api.get(`/warehouses/${encodeURIComponent(id)}`);
  return getResponseData(response);
}

export async function createWarehouse(payload) {
  const response = await api.post("/warehouses", payload);
  return getResponseData(response);
}

export async function updateWarehouse(id, payload) {
  const response = await api.patch(`/warehouses/${encodeURIComponent(id)}`, payload);
  return getResponseData(response);
}

export async function deleteWarehouse(id) {
  const response = await api.delete(`/warehouses/${encodeURIComponent(id)}`);
  return getResponseData(response);
}

export default {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
