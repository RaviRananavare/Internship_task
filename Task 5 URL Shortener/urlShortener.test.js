const {
  shortenUrl,
  getOriginalUrl,
  getUrlInfo,
  generateShortCode,
  clearStore
} = require("./urlShortener");

describe("URL Shortener", () => {

  beforeEach(() => {
    clearStore();
  });

  test("generates a 6-character short code", () => {
    const code = generateShortCode();

    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Za-z0-9]{6}$/);
  });

  test("shortens a valid URL", () => {
    const result = shortenUrl("https://example.com");

    expect(result.longUrl).toBe("https://example.com");
    expect(result.code).toHaveLength(6);
  });

  test("retrieves the original URL using the short code", () => {
    const result = shortenUrl("https://example.com");

    expect(getOriginalUrl(result.code)).toBe(
      "https://example.com"
    );
  });

  test("returns URL information", () => {
    const result = shortenUrl("https://example.com");

    const info = getUrlInfo(result.code);

    expect(info.code).toBe(result.code);
    expect(info.longUrl).toBe("https://example.com");
    expect(info.createdAt).toBeInstanceOf(Date);
  });

  test("returns null for an unknown short code", () => {
    expect(getOriginalUrl("ABC123")).toBeNull();
  });

  test("returns null for URL info of an unknown code", () => {
    expect(getUrlInfo("ABC123")).toBeNull();
  });

  test("rejects an invalid URL", () => {
    expect(() => {
      shortenUrl("not-a-url");
    }).toThrow("Invalid URL");
  });

  test("accepts HTTP URLs", () => {
    const result = shortenUrl("http://example.com");

    expect(result.longUrl).toBe("http://example.com");
  });

  test("accepts HTTPS URLs", () => {
    const result = shortenUrl("https://example.com");

    expect(result.longUrl).toBe("https://example.com");
  });

  test("returns the existing short code for a duplicate URL", () => {
    const first = shortenUrl("https://example.com");
    const second = shortenUrl("https://example.com");

    expect(second.code).toBe(first.code);
  });

  test("does not create a second mapping for a duplicate URL", () => {
    const first = shortenUrl("https://example.com");
    const second = shortenUrl("https://example.com");

    expect(getUrlInfo(first.code).code).toBe(second.code);
  });

  test("creates a custom alias", () => {
    const result = shortenUrl(
      "https://example.com",
      "myLink"
    );

    expect(result.code).toBe("myLink");
    expect(getOriginalUrl("myLink")).toBe(
      "https://example.com"
    );
  });

  test("rejects a duplicate custom alias", () => {
    shortenUrl("https://example.com", "myLink");

    expect(() => {
      shortenUrl("https://google.com", "myLink");
    }).toThrow("Custom alias already exists");
  });

  test("rejects an invalid custom alias", () => {
    expect(() => {
      shortenUrl(
        "https://example.com",
        "invalid alias!"
      );
    }).toThrow("Invalid custom alias");
  });

  test("rejects an empty custom alias", () => {
    expect(() => {
      shortenUrl("https://example.com", "");
    }).not.toThrow();
  });

  test("generates different codes for different URLs", () => {
    const first = shortenUrl("https://example.com");
    const second = shortenUrl("https://google.com");

    expect(first.code).not.toBe(second.code);
  });

  test("clearStore removes all URL mappings", () => {
    const result = shortenUrl("https://example.com");

    clearStore();

    expect(getOriginalUrl(result.code)).toBeNull();
  });

});