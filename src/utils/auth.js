import { getAccessToken, getRefreshToken, clearTokens, isTokenExpired } from "./tokenService";

export const isAuthenticated = () => {
  const accessToken = getAccessToken();
  if (accessToken && !isTokenExpired(accessToken)) return true;
  const refreshToken = getRefreshToken();
  return !!(refreshToken && !isTokenExpired(refreshToken));
};

export const isAdminAuthenticated = () => {
  const token = localStorage.getItem("adminAccessToken");
  return !!token && !isTokenExpired(token);
};

export const logout = () => {
  clearTokens();
  if (window.location.pathname !== "/signin") window.location.replace("/signin");
};

export { getAccessToken, getRefreshToken } from "./tokenService";
