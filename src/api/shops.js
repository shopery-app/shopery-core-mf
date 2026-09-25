import { apiClient, unwrap } from "./client";

// Public — note: the backend does not support server-side name filtering,
// only pagination. Callers that need search must filter client-side.
export const getAllShops = ({ page = 0, size = 100, sort } = {}) =>
  apiClient.get("/shops", { params: { page, size, sort } }).then(unwrap);

export const getShopById = (shopId) => apiClient.get(`/shops/id/${shopId}`).then(unwrap);
export const getShopByName = (shopName) => apiClient.get(`/shops/name/${shopName}`).then(unwrap);

// Seller-owned
export const getMyShopDashboard = () => apiClient.get("/users/me/shops/dashboard").then(unwrap);
export const rateShop = (shopId, rating) =>
  apiClient.post(`/users/me/shops/${shopId}/rating`, null, { params: { rating } }).then(unwrap);
