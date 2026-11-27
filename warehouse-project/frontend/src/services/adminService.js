import api from "./api.js";

function getResponseData(response) {
  return response?.data?.data ?? response?.data;
}

export async function getDashboardSummary() {
  return getResponseData(await api.get("/admin/dashboard"));
}

export async function getLowStock() {
  const response = await api.get("/admin/low-stock");
  const stock = getResponseData(response);
  if (!Array.isArray(stock)) {
    throw new Error("The low stock endpoint returned an invalid response.");
  }
  return stock;
}

export default { getDashboardSummary, getLowStock };
