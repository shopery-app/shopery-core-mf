import { apiClient, unwrap } from "./client";

export const getDropdown = (type) => apiClient.get(`/dropdowns/${type}`).then(unwrap);
