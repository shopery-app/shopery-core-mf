import { apiClient, unwrap } from "./client";

export const getMyProfile = () => apiClient.get("/users/me/profile").then(unwrap);
export const updateMyProfile = (payload) => apiClient.put("/users/me/profile", payload).then(unwrap);
export const createMyShop = (payload) => apiClient.post("/users/me/shop", payload).then(unwrap);
export const updateMyPassword = (payload) => apiClient.put("/users/me/password", payload).then(unwrap);
export const changeMyEmail = (payload) => apiClient.put("/users/me/email", payload).then(unwrap);
export const verifyMyEmail = (payload) => apiClient.post("/users/me/email/verify", payload).then(unwrap);

export const uploadProfilePhoto = (file) => {
  const form = new FormData();
  form.append("file", file);
  return apiClient.post("/users/me/photo", form, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
};
export const deleteProfilePhoto = () => apiClient.delete("/users/me/photo").then(unwrap);
