function redactAddress(value) {
  if (!value || value.length < 12) return "";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function redactUrl(value) {
  if (!value) return "";
  return value.replace(/\/(v2|v3)\/[^/?#]+/i, "/$1/[redacted]");
}

module.exports = {
  redactAddress,
  redactUrl,
};
