const applyDiscount = require("./applyDiscount");

describe("applyDiscount", () => {

  // Normal cases

  test("returns original price when no discount applies", () => {
    expect(applyDiscount(100, "new", null)).toBe(100);
  });

  test("applies 15% discount for VIP customer", () => {
    expect(applyDiscount(100, "vip", null)).toBe(85);
  });

  test("applies 5% discount for regular customer", () => {
    expect(applyDiscount(100, "regular", null)).toBe(95);
  });

  // Coupon cases

  test("applies SAVE20 coupon", () => {
    expect(applyDiscount(100, "new", "SAVE20")).toBe(80);
  });

  test("applies SAVE10 coupon", () => {
    expect(applyDiscount(100, "new", "SAVE10")).toBe(90);
  });

  test("SAVE20 overrides VIP discount", () => {
    expect(applyDiscount(100, "vip", "SAVE20")).toBe(80);
  });

  test("SAVE10 does not reduce VIP discount", () => {
    expect(applyDiscount(100, "vip", "SAVE10")).toBe(85);
  });

  test("SAVE20 overrides regular customer discount", () => {
    expect(applyDiscount(100, "regular", "SAVE20")).toBe(80);
  });

  test("SAVE10 overrides regular customer discount", () => {
    expect(applyDiscount(100, "regular", "SAVE10")).toBe(90);
  });

  // Edge cases

  test("handles zero price", () => {
    expect(applyDiscount(0, "vip", "SAVE20")).toBe(0);
  });

  test("handles decimal prices and rounds to two decimals", () => {
    expect(applyDiscount(99.99, "regular", null)).toBe(94.99);
  });

  test("handles unknown customer type without discount", () => {
    expect(applyDiscount(100, "unknown", null)).toBe(100);
  });

  test("handles unknown coupon code without discount", () => {
    expect(applyDiscount(100, "new", "INVALID")).toBe(100);
  });

  test("handles missing coupon code", () => {
    expect(applyDiscount(100, "regular")).toBe(95);
  });

  // Error cases

  test("throws error for negative price", () => {
    expect(() => {
      applyDiscount(-100, "regular", null);
    }).toThrow("Invalid price");
  });

  test("throws error for any negative price", () => {
    expect(() => {
      applyDiscount(-0.01, "vip", "SAVE20");
    }).toThrow("Invalid price");
  });

});