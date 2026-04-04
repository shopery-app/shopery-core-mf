import axios from "axios";
import { isTokenExpired, refreshAccessToken } from "./tokenService";
import { apiURL } from "../Backend/Api/api";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

axios.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};

  const isRefreshCall =
      (config.url || "").includes("/auth/refresh-token") ||
      (config.url || "").includes("/auth-refresh");

  const hasSkipHeader = config.headers["X-Skip-Auth"] === "1";
  const skipAuth = hasSkipHeader || config.meta?.skipAuth === true;
  if (hasSkipHeader) delete config.headers["X-Skip-Auth"]; // prevent CORS preflight

  if (isRefreshCall || skipAuth) return config;

  const isAdminRequest = (config.url || "").includes("/admin");
  if (isAdminRequest) {
    const adminAT = localStorage.getItem("adminAccessToken");
    if (adminAT) config.headers.Authorization = `Bearer ${adminAT}`;
    return config;
  }

  let accessToken = localStorage.getItem("accessToken");

  if (!accessToken) return config;

  const headerToken = (config.headers.Authorization || "").replace(/^Bearer\s+/i, "");
  const headerMatchesCurrent = headerToken === accessToken;

  if (headerMatchesCurrent && isTokenExpired(accessToken)) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        accessToken = await refreshAccessToken();
        processQueue(null, accessToken);
      } catch (err) {
        processQueue(err, null);
        throw err;
      } finally {
        isRefreshing = false;
      }
    } else {
      accessToken = await new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
      );
    }
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  if (!config.headers.Authorization) {
    if (isTokenExpired(accessToken)) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          accessToken = await refreshAccessToken();
          processQueue(null, accessToken);
        } catch (err) {
          processQueue(err, null);
          throw err;
        } finally {
          isRefreshing = false;
        }
      } else {
        accessToken = await new Promise((resolve, reject) =>
            failedQueue.push({ resolve, reject })
        );
      }
    }
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config || {};
      const isRefresh =
          (original.url || "").includes("/auth/refresh-token") ||
          (original.url || "").includes("/auth-refresh");

      const status = error.response?.status;
      const shouldRetry =
          !isRefresh &&
          (status === 401 || status === 403) &&
          !original._retry;

      if (!shouldRetry) return Promise.reject(error);

      original._retry = true;

      const isAdminRequest = (original.url || "").includes("/admin");
      if (isAdminRequest) {
        const adminRefreshToken = localStorage.getItem("adminRefreshToken");
        try {
          if (!adminRefreshToken) throw new Error("No adminRefreshToken");

          const response = await axios.post(
              `${apiURL}/auth/refresh-token`,
              { refreshToken: adminRefreshToken },
              { headers: { "Content-Type": "application/json" }, meta: { skipAuth: true } }
          );

          const data = response.data?.data || response.data;
          if (!data?.accessToken) throw new Error("No admin accessToken from refresh");

          localStorage.setItem("adminAccessToken", data.accessToken);
          if (data.refreshToken) localStorage.setItem("adminRefreshToken", data.refreshToken);

          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(original);
        } catch (e) {
          localStorage.removeItem("adminAccessToken");
          localStorage.removeItem("adminRefreshToken");
          localStorage.removeItem("adminUser");
          window.location.href = "/admins";
          return Promise.reject(e);
        }
      }

      const refreshToken = localStorage.getItem("refreshToken");
      try {
        if (!refreshToken) throw new Error("No refreshToken");

        const response = await axios.post(
            `${apiURL}/auth/refresh-token`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" }, meta: { skipAuth: true } }
        );

        const data = response.data?.data || response.data;
        if (!data?.accessToken) throw new Error("No accessToken from refresh");

        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios(original);
      } catch (e) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");
        if (window.location.pathname !== "/signin") {
          window.location.replace("/signin");
        }
        return Promise.reject(e);
      }
    }
);
