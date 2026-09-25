import axios from "axios";

export const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const apiClient = axios.create({ baseURL: apiURL });

const isAdminUrl = (url = "") => url.startsWith("/admins");
const isAuthRefreshUrl = (url = "") => url.includes("/auth/refresh-token");

const readToken = (isAdmin) => localStorage.getItem(isAdmin ? "adminAccessToken" : "accessToken");
const readRefreshToken = (isAdmin) => localStorage.getItem(isAdmin ? "adminRefreshToken" : "refreshToken");

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp < Date.now() / 1000 + 30;
  } catch {
    return true;
  }
};

const clearSession = (isAdmin) => {
  if (isAdmin) {
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminUser");
  } else {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
  }
  window.dispatchEvent(new CustomEvent("authStateChanged"));
};

let refreshInFlight = null;

const refreshSession = async (isAdmin) => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = readRefreshToken(isAdmin);
    if (!refreshToken) throw new Error("No refresh token");

    const { data } = await axios.post(
      `${apiURL}/auth/refresh-token`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    const payload = data?.data || data;
    if (!payload?.accessToken) throw new Error("Refresh response missing accessToken");

    localStorage.setItem(isAdmin ? "adminAccessToken" : "accessToken", payload.accessToken);
    if (payload.refreshToken) {
      localStorage.setItem(isAdmin ? "adminRefreshToken" : "refreshToken", payload.refreshToken);
    }
    window.dispatchEvent(new CustomEvent("authStateChanged"));
    return payload.accessToken;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

apiClient.interceptors.request.use(async (config) => {
  if (config.skipAuth || isAuthRefreshUrl(config.url)) return config;

  const isAdmin = isAdminUrl(config.url);
  let token = readToken(isAdmin);
  if (!token) return config;

  if (isTokenExpired(token)) {
    try {
      token = await refreshSession(isAdmin);
    } catch {
      return config;
    }
  }

  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const isAdmin = isAdminUrl(original.url);

    const shouldRetry = (status === 401 || status === 403) && !original._retry && !isAuthRefreshUrl(original.url);
    if (!shouldRetry) return Promise.reject(error);

    original._retry = true;

    try {
      const token = await refreshSession(isAdmin);
      original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
      return apiClient(original);
    } catch {
      clearSession(isAdmin);
      const loginPath = isAdmin ? "/admins" : "/signin";
      if (window.location.pathname !== loginPath) window.location.replace(loginPath);
      return Promise.reject(error);
    }
  },
);

export const unwrap = (response) => response.data?.data;
