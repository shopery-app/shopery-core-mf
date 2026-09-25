import { apiURL } from "../api/client";

export const buildWsUrl = (token) => {
  const base = apiURL.replace("/api/v1", "/ws").replace(/^http/, "ws");
  return `${base}?token=${token}`;
};
