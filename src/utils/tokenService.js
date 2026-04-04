import axios from "axios";
import { apiURL } from "../Backend/Api/api";

export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  window.dispatchEvent(new CustomEvent("authStateChanged"));
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("merchantAccessToken");
  localStorage.removeItem("merchantRefreshToken");

  window.dispatchEvent(new CustomEvent("authStateChanged"));
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    return payload.exp < currentTime + 30;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true;
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }


    const tryRefresh = async (url) => {
      const resp = await axios.post(
        url,
        { refreshToken },
        { headers: { "X-Skip-Auth": "1" }, meta: { skipAuth: true } }
      );

      let at, rt;
      if (resp.data?.data?.accessToken) {
        at = resp.data.data.accessToken;
        rt = resp.data.data.refreshToken || refreshToken;
      } else if (resp.data?.accessToken) {
        at = resp.data.accessToken;
        rt = resp.data.refreshToken || refreshToken;
      }

      if (!at) {
        if (
          !resp.data?.status &&
          (resp.status === 200 || resp.status === 201)
        ) {
          if (at) {
            // no-op
          }
        } else {
          throw new Error("Invalid refresh response shape");
        }
      }

      setTokens(at, rt);
      return at;
    };

    try {
      return await tryRefresh(`${apiURL}/auth/refresh-token`);
    } catch (e1) {
      console.warn(
        "Primary refresh endpoint failed, trying fallback /auth-refresh",
        e1?.message
      );
      return await tryRefresh(`${apiURL}/auth-refresh`);
    }
  } catch (error) {
    console.error("❌ Token refresh failed:", error);

    clearTokens();

    if (window.location.pathname !== "/signin") {
      window.location.replace("/signin");
    }

    throw error;
  }
};
