import { apiClient, unwrap } from "./client";

export const createCheckoutSession = () => apiClient.post("/payments/stripe/checkout").then(unwrap);
