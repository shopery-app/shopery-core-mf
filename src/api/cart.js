import { apiClient, unwrap } from "./client";

export const getMyCart = () => apiClient.get("/users/me/cart").then(unwrap);
export const addToCart = (productId, quantity) =>
  apiClient.post(`/users/me/cart/${productId}`, { quantity }).then(unwrap);
export const updateCartItem = (productId, quantity) =>
  apiClient.put(`/users/me/cart/${productId}`, { quantity }).then(unwrap);
export const removeFromCart = (productId) => apiClient.delete(`/users/me/cart/${productId}`).then(unwrap);
export const clearCart = () => apiClient.delete("/users/me/cart").then(unwrap);
export const moveFromWishlist = (productId) =>
  apiClient.post(`/users/me/cart/move-from-wishlist/${productId}`).then(unwrap);
