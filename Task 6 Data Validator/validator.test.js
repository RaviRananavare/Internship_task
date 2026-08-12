const validate = require("./validator");

describe("Data Validator", () => {
  // -------------------------
  // Required field tests
  // -------------------------

  test("passes when required field is provided", () => {
    const result = validate(
      { name: "Raviraj" },
      { name: { type: "string", required: true } }
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("fails when required field is missing", () => {
    const result = validate(
      {},
      { name: { type: "string", required: true } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("name is required");
  });

  test("fails when required field is empty", () => {
    const result = validate(
      { name: "" },
      { name: { type: "string", required: true } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("name is required");
  });

  // -------------------------
  // String validation
  // -------------------------

  test("accepts a valid string", () => {
    const result = validate(
      { name: "Raviraj" },
      { name: { type: "string" } }
    );

    expect(result.valid).toBe(true);
  });

  test("rejects a non-string value", () => {
    const result = validate(
      { name: 123 },
      { name: { type: "string" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("name must be a string");
  });

  test("accepts string at minimum length", () => {
    const result = validate(
      { name: "Ab" },
      { name: { type: "string", min: 2 } }
    );

    expect(result.valid).toBe(true);
  });

  test("rejects string below minimum length", () => {
    const result = validate(
      { name: "A" },
      { name: { type: "string", min: 2 } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "name must be at least 2 characters long"
    );
  });

  test("accepts string at maximum length", () => {
    const result = validate(
      { name: "ABCDE" },
      { name: { type: "string", max: 5 } }
    );

    expect(result.valid).toBe(true);
  });

  test("rejects string above maximum length", () => {
    const result = validate(
      { name: "ABCDEFG" },
      { name: { type: "string", max: 5 } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "name must be at most 5 characters long"
    );
  });

  test("validates string with both min and max", () => {
    const result = validate(
      { name: "Raviraj" },
      { name: { type: "string", min: 2, max: 50 } }
    );

    expect(result.valid).toBe(true);
  });

  // -------------------------
  // Number validation
  // -------------------------

  test("accepts a valid number", () => {
    const result = validate(
      { age: 25 },
      { age: { type: "number" } }
    );

    expect(result.valid).toBe(true);
  });

  test("rejects a non-number value", () => {
    const result = validate(
      { age: "25" },
      { age: { type: "number" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("age must be a number");
  });

  test("accepts number at minimum value", () => {
    const result = validate(
      { age: 18 },
      { age: { type: "number", min: 18 } }
    );

    expect(result.valid).toBe(true);
  });

  test("rejects number below minimum", () => {
    const result = validate(
      { age: 17 },
      { age: { type: "number", min: 18 } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("age must be at least 18");
  });

  test("accepts number at maximum value", () => {
    const result = validate(
      { age: 120 },
      { age: { type: "number", max: 120 } }
    );

    expect(result.valid).toBe(true);
  });

  test("rejects number above maximum", () => {
    const result = validate(
      { age: 121 },
      { age: { type: "number", max: 120 } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("age must be at most 120");
  });

  test("accepts decimal numbers", () => {
    const result = validate(
      { price: 99.99 },
      { price: { type: "number", min: 0 } }
    );

    expect(result.valid).toBe(true);
  });

  test("rejects NaN", () => {
    const result = validate(
      { age: NaN },
      { age: { type: "number" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("age must be a number");
  });

  // -------------------------
  // Email validation
  // -------------------------

  test("accepts a valid email", () => {
    const result = validate(
      { email: "raviraj@example.com" },
      { email: { type: "email" } }
    );

    expect(result.valid).toBe(true);
  });

  test("accepts email with subdomain", () => {
    const result = validate(
      { email: "user@mail.example.com" },
      { email: { type: "email" } }
    );

    expect(result.valid).toBe(true);
  });

  test("rejects email without @", () => {
    const result = validate(
      { email: "ravirajexample.com" },
      { email: { type: "email" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("email must be a valid email");
  });

  test("rejects email without domain", () => {
    const result = validate(
      { email: "raviraj@" },
      { email: { type: "email" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("email must be a valid email");
  });

  test("rejects email with spaces", () => {
    const result = validate(
      { email: "ravi raj@example.com" },
      { email: { type: "email" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("email must be a valid email");
  });

  test("rejects non-string email", () => {
    const result = validate(
      { email: 12345 },
      { email: { type: "email" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("email must be a valid email");
  });

  // -------------------------
  // URL validation
  // -------------------------

  test("accepts a valid HTTP URL", () => {
    const result = validate(
      { website: "http://example.com" },
      { website: { type: "url" } }
    );

    expect(result.valid).toBe(true);
  });

  test("accepts a valid HTTPS URL", () => {
    const result = validate(
      { website: "https://example.com" },
      { website: { type: "url" } }
    );

    expect(result.valid).toBe(true);
  });

  test("accepts URL with path", () => {
    const result = validate(
      { website: "https://example.com/products/123" },
      { website: { type: "url" } }
    );

    expect(result.valid).toBe(true);
  });

  test("rejects invalid URL", () => {
    const result = validate(
      { website: "not-a-url" },
      { website: { type: "url" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("website must be a valid URL");
  });

  test("rejects non-string URL", () => {
    const result = validate(
      { website: 12345 },
      { website: { type: "url" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("website must be a valid URL");
  });

  test("rejects FTP URL", () => {
    const result = validate(
      { website: "ftp://example.com" },
      { website: { type: "url" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("website must be a valid URL");
  });

  // -------------------------
  // Date validation
  // -------------------------

  test("accepts a valid ISO date", () => {
    const result = validate(
      { birthDate: "2003-12-14" },
      { birthDate: { type: "date" } }
    );

    expect(result.valid).toBe(true);
  });

  test("accepts a valid ISO datetime", () => {
    const result = validate(
      { createdAt: "2026-08-10T12:30:00Z" },
      { createdAt: { type: "date" } }
    );

    expect(result.valid).toBe(true);
  });

  test("accepts ISO datetime with milliseconds", () => {
    const result = validate(
      { createdAt: "2026-08-10T12:30:00.000Z" },
      { createdAt: { type: "date" } }
    );

    expect(result.valid).toBe(true);
  });

  test("rejects invalid date format", () => {
    const result = validate(
      { birthDate: "14-12-2003" },
      { birthDate: { type: "date" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "birthDate must be a valid ISO date"
    );
  });

  test("rejects invalid date", () => {
    const result = validate(
      { birthDate: "2026-99-99" },
      { birthDate: { type: "date" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "birthDate must be a valid ISO date"
    );
  });

  test("rejects non-string date", () => {
    const result = validate(
      { birthDate: 20260810 },
      { birthDate: { type: "date" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "birthDate must be a valid ISO date"
    );
  });

  // -------------------------
  // Optional fields
  // -------------------------

  test("allows missing optional field", () => {
    const result = validate(
      { name: "Raviraj" },
      {
        name: { type: "string", required: true },
        website: { type: "url", required: false },
      }
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("allows null optional field", () => {
    const result = validate(
      { website: null },
      { website: { type: "url", required: false } }
    );

    expect(result.valid).toBe(true);
  });

  // -------------------------
  // Multiple fields / errors
  // -------------------------

  test("validates multiple fields together", () => {
    const schema = {
      name: { type: "string", required: true, min: 2, max: 50 },
      email: { type: "email", required: true },
      age: { type: "number", min: 18, max: 120 },
      website: { type: "url", required: false },
      birthDate: { type: "date" },
    };

    const data = {
      name: "Raviraj",
      email: "ravi@example.com",
      age: 22,
      website: "https://example.com",
      birthDate: "2003-12-14",
    };

    const result = validate(data, schema);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("returns multiple errors for invalid data", () => {
    const schema = {
      name: { type: "string", required: true, min: 2 },
      email: { type: "email", required: true },
      age: { type: "number", min: 18 },
    };

    const data = {
      name: "A",
      email: "invalid-email",
      age: 15,
    };

    const result = validate(data, schema);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  test("rejects invalid data object", () => {
    const result = validate(
      null,
      { name: { type: "string" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Data must be an object");
  });

  test("rejects invalid schema object", () => {
    const result = validate(
      { name: "Raviraj" },
      null
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Schema must be an object");
  });

  test("reports unsupported validation type", () => {
    const result = validate(
      { username: "ravi" },
      { username: { type: "password" } }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "username has an unsupported type"
    );
  });
});