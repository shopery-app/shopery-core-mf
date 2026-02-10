import axios from "axios";

export const MODE_KEY = "appMode";
export const MERCHANT_AT_KEY = "accessToken";
export const MERCHANT_RT_KEY = "refreshToken";

export const hasMerchantAccount = () =>
  !!localStorage.getItem(MERCHANT_AT_KEY) &&
  !!localStorage.getItem(MERCHANT_RT_KEY);

export const getAppMode = () =>
  localStorage.getItem(MODE_KEY) === "merchant" ? "merchant" : "customer";

export const setAppMode = (mode) => {
  if (mode !== "merchant" && mode !== "customer") return;
  if (mode === "merchant" && !hasMerchantAccount()) return;
  localStorage.setItem(MODE_KEY, mode);
  applyAuthHeaderForMode();
};

export const clearMerchantSession = () => {
  localStorage.removeItem(MERCHANT_AT_KEY);
  localStorage.removeItem(MERCHANT_RT_KEY);
  setAppMode("customer");
};

export const applyAuthHeaderForMode = () => {
  const mode = getAppMode();
  const customerAT = localStorage.getItem("accessToken");
  const merchantAT = localStorage.getItem(MERCHANT_AT_KEY);
  const token = mode === "merchant" ? merchantAT : customerAT;

  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};
