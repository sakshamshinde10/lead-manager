// MongoDB reports a violated unique index with error code 11000.
// Controllers use this to turn it into a friendly 409 Conflict.
const isDuplicateKeyError = (err) => err?.code === 11000;

module.exports = { isDuplicateKeyError };
