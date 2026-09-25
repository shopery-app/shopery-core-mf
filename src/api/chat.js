import { apiClient, unwrap } from "./client";

export const getConversation = (otherUserId) => apiClient.get(`/chat/conversation/${otherUserId}`).then(unwrap);
export const getConversations = () => apiClient.get("/chat/conversations").then(unwrap);
export const sendAdvisoryChatMessage = (message) => apiClient.post("/users/me/chat", { message }).then(unwrap);
