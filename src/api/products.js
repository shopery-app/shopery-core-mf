import { apiClient, unwrap } from "./client";

export const searchProducts = ({ category, condition, minPrice, maxPrice, keyword, page = 0, size = 20, sort } = {}) =>
  apiClient
    .get("/products", { params: { category, condition, minPrice, maxPrice, keyword, page, size, sort } })
    .then(unwrap);

export const getProductById = (productId) => apiClient.get(`/products/${productId}`).then(unwrap);

export const getTopDiscountedProducts = ({ page = 0, size = 20 } = {}) =>
  apiClient.get("/products/top-discounts", { params: { page, size } }).then(unwrap);

// Seller-owned product management
export const getMyProducts = ({ page = 0, size = 20, sort } = {}) =>
  apiClient.get("/users/me/products", { params: { page, size, sort } }).then(unwrap);

export const addProduct = (payload) => apiClient.post("/users/me/products", payload).then(unwrap);
export const updateProduct = (productId, payload) => apiClient.put(`/users/me/products/${productId}`, payload).then(unwrap);
export const deleteProduct = (productId) => apiClient.delete(`/users/me/products/${productId}`).then(unwrap);
export const deleteProductImage = (productId) => apiClient.delete(`/users/me/products/${productId}/image`).then(unwrap);

export const uploadProductImage = (productId, file) => {
  const form = new FormData();
  form.append("image", file);
  return apiClient
    .post(`/users/me/products/${productId}/image`, form, { headers: { "Content-Type": "multipart/form-data" } })
    .then(unwrap);
};
