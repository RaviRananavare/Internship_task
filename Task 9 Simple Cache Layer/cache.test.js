const Cache = require("./cache");

describe("Simple Cache Layer", () => {
  let c;

  beforeEach(() => {
    jest.useFakeTimers();
    c = new Cache();
  });

  afterEach(() => {
    c.clear();
    jest.useRealTimers();
  });

  test("string", () => {
    c.set("k", "v");
    expect(c.get("k")).toBe("v");
  });

  test("number", () => {
    c.set("n", 42);
    expect(c.get("n")).toBe(42);
  });

  test("object", () => {
    const v = { a: 1 };
    c.set("o", v);
    expect(c.get("o")).toBe(v);
  });

  test("array", () => {
    c.set("a", [1, 2]);
    expect(c.get("a")).toEqual([1, 2]);
  });

  test("missing is undefined", () => {
    expect(c.get("x")).toBeUndefined();
  });

  test("has", () => {
    c.set("k", "v");

    expect(c.has("k")).toBe(true);
    expect(c.has("x")).toBe(false);
  });

  test("delete", () => {
    c.set("k", 1);

    expect(c.del("k")).toBe(true);
    expect(c.has("k")).toBe(false);
  });

  test("clear", () => {
    c.set("a", 1);
    c.set("b", 2);
    c.clear();

    expect(c.stats().totalEntries).toBe(0);
  });

  test("TTL expires", () => {
    c.set("k", "v", 5);

    jest.advanceTimersByTime(4999);
    expect(c.get("k")).toBe("v");

    jest.advanceTimersByTime(1);
    expect(c.get("k")).toBeUndefined();
  });

  test("TTL update", () => {
    c.set("k", "v", 5);

    jest.advanceTimersByTime(4000);
    expect(c.ttl("k", 10)).toBe(true);

    jest.advanceTimersByTime(9000);
    expect(c.get("k")).toBe("v");

    jest.advanceTimersByTime(1000);
    expect(c.get("k")).toBeUndefined();
  });

  test("no TTL", () => {
    c.set("k", "v");

    jest.advanceTimersByTime(100000);

    expect(c.get("k")).toBe("v");
  });

  test("hits", () => {
    c.set("k", 1);
    c.get("k");
    c.get("k");

    expect(c.stats().totalHits).toBe(2);
  });

  test("misses", () => {
    c.get("x");
    c.get("x");

    expect(c.stats().totalMisses).toBe(2);
  });

  test("hit rate", () => {
    c.set("k", 1);
    c.get("k");
    c.get("x");

    expect(c.stats().hitRate).toBe(0.5);
  });

  test("expired absent from stats", () => {
    c.set("k", 1, 1);

    jest.advanceTimersByTime(1000);

    expect(c.stats().totalEntries).toBe(0);
  });

  test("bad ttl", () => {
    expect(() => c.set("k", 1, 0)).toThrow("TTL");
    expect(() => c.ttl("x", -1)).toThrow("TTL");
  });
});