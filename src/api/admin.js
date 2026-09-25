import { apiClient, unwrap } from "./client";

export const getUsers = ({ page = 0, size = 10 } = {}) =>
  apiClient.get("/admins/users", { params: { page, size } }).then(unwrap);
export const closeUser = (id) => apiClient.patch(`/admins/users/${id}/close`).then(unwrap);

export const getShops = ({ page = 0, size = 10 } = {}) =>
  apiClient.get("/admins/shops", { params: { page, size } }).then(unwrap);

export const getTasks = ({ taskCategory, page = 0, size = 10 } = {}) =>
  apiClient.get("/admins/tasks", { params: { taskCategory, page, size } }).then(unwrap);
export const closeTask = (id) => apiClient.patch(`/admins/tasks/${id}/close`).then(unwrap);
export const approveTask = (id) => apiClient.post(`/admins/tasks/${id}/approve`).then(unwrap);
export const rejectTask = (id, reason) => apiClient.post(`/admins/tasks/${id}/reject`, { reason }).then(unwrap);
