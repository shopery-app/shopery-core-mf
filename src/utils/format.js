export const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

export const formatDate = (value, options = { month: "short", day: "numeric", year: "numeric" }) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, options);
  } catch {
    return "—";
  }
};

export const formatEnumLabel = (value) => {
  if (!value) return "";
  return value
    .toString()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
