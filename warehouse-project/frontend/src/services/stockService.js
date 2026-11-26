import api from "./api.js";

function getResponseData(response) {
  return response?.data?.data ?? response?.data;
}

export async function getStock(params = {}) {
  const response = await api.get("/stock", { params });
  const stock = getResponseData(response);
  if (!Array.isArray(stock)) {
    throw new Error("The stock endpoint returned an invalid response.");
  }
  return stock;
}

export async function stockIn(payload) {
  const response = await api.post("/stock/add", payload);
  return getResponseData(response);
}

export async function stockOut(payload) {
  const response = await api.post("/stock/remove", payload);
  return getResponseData(response);
}

export async function getTransactions() {
  const response = await api.get("/admin/transactions");
  const transactions = getResponseData(response);
  if (!Array.isArray(transactions)) {
    throw new Error("The transactions endpoint returned an invalid response.");
  }
  return transactions;
}

export async function getWarehouseStock(warehouseId) {
  const response = await api.get("/stock", {
    params: { warehouse: warehouseId },
  });
  const stock = getResponseData(response);
  if (!Array.isArray(stock)) {
    throw new Error("The stock endpoint returned an invalid response.");
  }
  return stock;
}

export async function getProductStock(productId) {
  const response = await api.get("/stock", {
    params: { product: productId },
  });
  const stock = getResponseData(response);
  if (!Array.isArray(stock)) {
    throw new Error("The stock endpoint returned an invalid response.");
  }
  return stock;
}

export default {
  getStock,
  stockIn,
  stockOut,
  getTransactions,
  getWarehouseStock,
  getProductStock,
};
