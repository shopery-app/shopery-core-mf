import { apiClient, unwrap } from "./client";

export const register = (payload) => apiClient.post("/auth/register", payload).then(unwrap);
export const login = (payload) => apiClient.post("/auth/login", payload).then(unwrap);
export const adminLogin = (payload) => apiClient.post("/auth/admin/login", payload, { skipAuth: true }).then(unwrap);
export const verifyAccount = (payload) => apiClient.post("/auth/verify", payload).then(unwrap);
export const resendCode = (payload) => apiClient.post("/auth/resend-code", payload).then(unwrap);
export const forgotPassword = (payload) => apiClient.post("/auth/forgot-password", payload).then(unwrap);
export const resetPassword = (payload) => apiClient.post("/auth/reset-password", payload).then(unwrap);
