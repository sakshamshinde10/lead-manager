const { signupSchema, loginSchema } = require("../../src/validators/auth");
const {
  createLeadSchema,
  updateLeadSchema,
  listQuerySchema,
} = require("../../src/validators/lead");

// Helper: the first error message for a given field, or undefined.
const errorFor = (result, field) =>
  result.error?.issues.find((issue) => issue.path[0] === field)?.message;

describe("signupSchema", () => {
  const valid = { name: "Test User", email: "test@example.com", password: "Password@123" };

  it("accepts valid input", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("trims and lowercases the email and trims the name", () => {
    const result = signupSchema.parse({ ...valid, name: "  Test  ", email: "  TEST@Example.COM " });
    expect(result.name).toBe("Test");
    expect(result.email).toBe("test@example.com");
  });

  it("rejects an invalid email, a short password and a one-letter name", () => {
    const result = signupSchema.safeParse({ name: "A", email: "nope", password: "short" });
    expect(result.success).toBe(false);
    expect(errorFor(result, "email")).toBe("Enter a valid email address");
    expect(errorFor(result, "password")).toBe("Password must be at least 8 characters");
    expect(errorFor(result, "name")).toBe("Name must be at least 2 characters");
  });

  it.each([
    ["has no number", "Password@abc", "Password must include a number"],
    ["has no special character", "Password123", "Password must include a special character"],
    ["is only letters", "abcdefghij", "Password must include a number"],
  ])("rejects a password that %s", (_label, password, message) => {
    const result = signupSchema.safeParse({ ...valid, password });
    expect(result.success).toBe(false);
    expect(errorFor(result, "password")).toBe(message);
  });

  it("accepts a password with 8+ characters, a number and a special character", () => {
    expect(signupSchema.safeParse({ ...valid, password: "abcdef1!" }).success).toBe(true);
  });

  it("does not apply the strength rules on login", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "weak" }).success).toBe(true);
  });

  it("rejects passwords longer than 72 characters (bcrypt limit)", () => {
    const result = signupSchema.safeParse({ ...valid, password: "x".repeat(73) });
    expect(errorFor(result, "password")).toBe("Password must be at most 72 characters");
  });

  it("reports missing fields", () => {
    const result = signupSchema.safeParse({});
    expect(errorFor(result, "name")).toBe("Name is required");
    expect(errorFor(result, "email")).toBe("Email is required");
    expect(errorFor(result, "password")).toBe("Password is required");
  });
});

describe("loginSchema", () => {
  it("does not apply password strength rules on login", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });

  it("requires a password", () => {
    expect(errorFor(loginSchema.safeParse({ email: "a@b.co", password: "" }), "password")).toBe(
      "Password is required"
    );
  });
});

describe("createLeadSchema", () => {
  const minimal = { name: "Ravi", email: "ravi@corp.com", source: "Referral" };

  it("accepts the minimal valid lead", () => {
    expect(createLeadSchema.safeParse(minimal).success).toBe(true);
  });

  it("requires name, email and source", () => {
    const result = createLeadSchema.safeParse({});
    expect(errorFor(result, "name")).toBeDefined();
    expect(errorFor(result, "email")).toBeDefined();
    expect(errorFor(result, "source")).toBeDefined();
  });

  it("rejects a source or status that is not in the allowed lists", () => {
    const result = createLeadSchema.safeParse({ ...minimal, source: "Pigeon", status: "Won" });
    expect(errorFor(result, "source")).toBe("Choose a valid source");
    expect(errorFor(result, "status")).toBe("Choose a valid status");
  });

  it("validates phone numbers but allows an empty phone", () => {
    expect(createLeadSchema.safeParse({ ...minimal, phone: "+91 98765-43210" }).success).toBe(true);
    expect(createLeadSchema.safeParse({ ...minimal, phone: "" }).success).toBe(true);
    expect(errorFor(createLeadSchema.safeParse({ ...minimal, phone: "abc" }), "phone")).toBe(
      "Enter a valid phone number"
    );
  });

  it("drops unknown fields such as owner (prevents mass assignment)", () => {
    const result = createLeadSchema.parse({ ...minimal, owner: "someone-else", _id: "123" });
    expect(result).not.toHaveProperty("owner");
    expect(result).not.toHaveProperty("_id");
  });
});

describe("updateLeadSchema", () => {
  it("accepts a partial update", () => {
    expect(updateLeadSchema.safeParse({ status: "Qualified" }).success).toBe(true);
  });

  it("rejects an empty update", () => {
    const result = updateLeadSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Provide at least one field to update");
  });

  it("does not add default values, so editing cannot overwrite existing data", () => {
    // If the schema had defaults, this would also contain status/phone/company.
    expect(updateLeadSchema.parse({ name: "New Name" })).toEqual({ name: "New Name" });
  });

  it("an update containing only an unknown field counts as empty", () => {
    expect(updateLeadSchema.safeParse({ owner: "someone-else" }).success).toBe(false);
  });
});

describe("listQuerySchema", () => {
  it("accepts search and status", () => {
    expect(listQuerySchema.parse({ search: " ravi ", status: "New" })).toEqual({
      search: "ravi",
      status: "New",
    });
  });

  it("treats empty strings as not set", () => {
    const result = listQuerySchema.parse({ search: "", status: "" });
    expect(result.search).toBeUndefined();
    expect(result.status).toBeUndefined();
  });

  it("rejects an invalid status", () => {
    expect(listQuerySchema.safeParse({ status: "Won" }).success).toBe(false);
  });
});
