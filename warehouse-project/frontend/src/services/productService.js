import api from "./api.js";

function getResponseData(response) {
  return response?.data?.data ?? response?.data;
}

export async function getProducts(params = {}) {
  const response = await api.get("/products", { params });
  const products = getResponseData(response);
  if (!Array.isArray(products)) {
    throw new Error("The products endpoint returned an invalid response.");
  }
  return products;
}

export async function getProduct(id) {
  const response = await api.get(`/products/${encodeURIComponent(id)}`);
  return getResponseData(response);
}

export async function createProduct(payload) {
  const response = await api.post("/products", payload);
  return getResponseData(response);
}

export async function updateProduct(id, payload) {
  const response = await api.patch(`/products/${encodeURIComponent(id)}`, payload);
  return getResponseData(response);
}

export async function deleteProduct(id) {
  const response = await api.delete(`/products/${encodeURIComponent(id)}`);
  return getResponseData(response);
}

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload", formData);
  return getResponseData(response);
}

export default {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
