// Escapes characters that have a special meaning in regular expressions.
// Without this, a search for "a.*(" would be treated as a pattern: it could
// crash the query or be abused to make the database work very hard.
// With it, whatever the user types is searched for literally.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;
