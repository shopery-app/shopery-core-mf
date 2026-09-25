import { apiClient, unwrap } from "./client";

// Returns a plain List<OrderResponseDto> — not paginated.
export const getMyOrders = () => apiClient.get("/users/me/orders").then(unwrap);
