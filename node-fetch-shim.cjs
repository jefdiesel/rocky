// node-fetch v2 -> Workers global fetch
const f = (...args) => globalThis.fetch(...args);
module.exports = f;
module.exports.default = f;
module.exports.Headers = globalThis.Headers;
module.exports.Request = globalThis.Request;
module.exports.Response = globalThis.Response;
