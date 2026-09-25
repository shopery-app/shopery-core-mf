import { apiClient, unwrap } from "./client";

export const getMyAddresses = () => apiClient.get("/users/me/addresses").then(unwrap);
export const addAddress = (payload) => apiClient.post("/users/me/addresses", payload).then(unwrap);
export const updateAddress = (addressId, payload) =>
  apiClient.put(`/users/me/addresses/${addressId}`, payload).then(unwrap);
export const removeAddress = (addressId) => apiClient.delete(`/users/me/addresses/${addressId}`).then(unwrap);
export const setDefaultAddress = (addressId) =>
  apiClient.put(`/users/me/addresses/${addressId}/default`).then(unwrap);
