import api from "./api.js";

function getResponseData(response) {
  return response?.data?.data ?? response?.data;
}

export async function getUsers() {
  const response = await api.get("/users");
  const users = getResponseData(response);
  if (!Array.isArray(users)) {
    throw new Error("The users endpoint returned an invalid response.");
  }
  return users;
}

export async function createUser(payload) {
  const response = await api.post("/users", payload);
  return getResponseData(response);
}

export async function updateUser(id, payload) {
  const response = await api.patch(`/users/${encodeURIComponent(id)}`, payload);
  return getResponseData(response);
}

export async function deleteUser(id) {
  const response = await api.delete(`/users/${encodeURIComponent(id)}`);
  return getResponseData(response);
}

export async function uploadUserImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload", formData);
  return getResponseData(response);
}

export default { getUsers, createUser, updateUser, deleteUser, uploadUserImage };
