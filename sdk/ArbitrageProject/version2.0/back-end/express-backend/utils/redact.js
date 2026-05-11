function redactAddress(value) {
  if (!value || value.length < 12) return "";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function redactUrl(value) {
  if (!value) return "";
  return value.replace(/\/(v2|v3)\/[^/?#]+/i, "/$1/[redacted]");
}

function redactSensitiveText(value) {
  return String(value || "")
    .replace(/(rawTransaction|serializedTx)"?\s*[:=]\s*"?0x[a-fA-F0-9]+/gi, "$1=[redacted]")
    .replace(/\/(v2|v3)\/[^/?#\s"']+/gi, "/$1/[redacted]")
    .replace(/\b(?:0x)?[a-fA-F0-9]{64,}\b/g, "[redacted-hex]");
}

module.exports = {
  redactAddress,
  redactSensitiveText,
  redactUrl,
};
