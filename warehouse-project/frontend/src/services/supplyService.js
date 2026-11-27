import api from "./api.js";

function getResponseData(response) {
  return response?.data?.data ?? response?.data;
}

function getRequestList(response) {
  const requests = getResponseData(response);
  if (!Array.isArray(requests)) {
    throw new Error("The supply requests endpoint returned an invalid response.");
  }
  return requests;
}

export async function getSupplyRequests(params = {}) {
  return getRequestList(await api.get("/supply", { params }));
}

export async function getMySupplyRequests() {
  return getRequestList(await api.get("/supply/my"));
}

export async function createSupplyRequest(payload) {
  return getResponseData(await api.post("/supply", payload));
}

export async function reviewSupplyRequest(id, status) {
  return getResponseData(
    await api.patch(`/supply/${encodeURIComponent(id)}/review`, { status }),
  );
}

export default {
  getSupplyRequests,
  getMySupplyRequests,
  createSupplyRequest,
  reviewSupplyRequest,
};
