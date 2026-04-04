export const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const getExpiryMs = (token) => {
  const payload = parseJwt(token);
  if (!payload?.exp) return 0;
  return payload.exp * 1000; // ms
};

export const msUntilExpiry = (token) => {
  const expMs = getExpiryMs(token);
  return expMs - Date.now();
};

export const isJwtExpired = (token, skewSeconds = 5) => {
  return msUntilExpiry(token) <= skewSeconds * 1000;
};

export const formatTimeLeft = (ms) => {
  if (ms <= 0) return "expired";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const remS = s % 60;
  return `${m}m ${remS}s`;
};
