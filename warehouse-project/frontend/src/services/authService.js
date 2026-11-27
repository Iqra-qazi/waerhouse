import api from "./api.js";

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response?.data?.data ?? response?.data;
}

export default { getCurrentUser };
