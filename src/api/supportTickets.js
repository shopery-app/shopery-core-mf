import { apiClient, unwrap } from "./client";

export const getMySupportTickets = ({ page = 0, size = 20 } = {}) =>
  apiClient.get("/users/me/support-tickets", { params: { page, size } }).then(unwrap);
export const createSupportTicket = (payload) => apiClient.post("/users/me/support-tickets", payload).then(unwrap);
export const updateSupportTicket = (id, payload) =>
  apiClient.put(`/users/me/support-tickets/${id}`, payload).then(unwrap);
export const deleteSupportTicket = (id) => apiClient.delete(`/users/me/support-tickets/${id}`).then(unwrap);
