import { apiClient, unwrap } from "./client";

export const getMyWishlist = () => apiClient.get("/users/me/wishlist").then(unwrap);
export const addToWishlist = (productId) => apiClient.post(`/users/me/wishlist/${productId}`).then(unwrap);
export const removeFromWishlist = (productId) => apiClient.delete(`/users/me/wishlist/${productId}`).then(unwrap);
export const clearWishlist = () => apiClient.delete("/users/me/wishlist").then(unwrap);
