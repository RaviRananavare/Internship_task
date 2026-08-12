function applyDiscount(price, customerType, couponCode) {
  if (price < 0) throw new Error("Invalid price");

  let discount = 0;

  if (customerType === "vip") {
    discount = 0.15;
  } else if (customerType === "regular") {
    discount = 0.05;
  }

  if (couponCode === "SAVE20") {
    discount = Math.max(discount, 0.20);
  } else if (couponCode === "SAVE10") {
    discount = Math.max(discount, 0.10);
  }

  const finalPrice = price * (1 - discount);

  return Math.round(finalPrice * 100) / 100;
}

module.exports = applyDiscount;