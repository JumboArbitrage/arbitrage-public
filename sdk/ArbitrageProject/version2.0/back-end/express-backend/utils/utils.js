const { redactAddress, redactUrl } = require("./redact");

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

module.exports = {
  redactAddress,
  redactUrl,
  sleep,
};
