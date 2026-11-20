const escapeRegex = require("../../src/utils/escapeRegex");

describe("escapeRegex", () => {
  it("leaves plain text unchanged", () => {
    expect(escapeRegex("Ravi Kumar")).toBe("Ravi Kumar");
  });

  it("escapes every regex special character", () => {
    expect(escapeRegex(".*+?^${}()|[]\\")).toBe("\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");
  });

  it("makes special characters match literally instead of as a pattern", () => {
    // Unescaped, "a.c" would match "abc" because "." means "any character".
    expect(new RegExp("a.c").test("abc")).toBe(true);
    expect(new RegExp(escapeRegex("a.c")).test("abc")).toBe(false);
    expect(new RegExp(escapeRegex("a.c")).test("a.c")).toBe(true);
  });

  it("produces a valid pattern even for text that would break a regex", () => {
    expect(() => new RegExp("(unclosed[")).toThrow();
    expect(() => new RegExp(escapeRegex("(unclosed["))).not.toThrow();
  });
});
