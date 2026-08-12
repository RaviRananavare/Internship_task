# applyDiscount Test Case Checklist

## Normal Cases

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC01 | No customer discount or coupon | Original price returned | ✅ |
| TC02 | VIP customer | 15% discount applied | ✅ |
| TC03 | Regular customer | 5% discount applied | ✅ |
| TC04 | Unknown customer type | No customer discount | ✅ |

## Coupon Cases

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC05 | SAVE20 coupon | 20% discount applied | ✅ |
| TC06 | SAVE10 coupon | 10% discount applied | ✅ |
| TC07 | VIP + SAVE20 | 20% discount applied | ✅ |
| TC08 | VIP + SAVE10 | 15% discount remains | ✅ |
| TC09 | Regular + SAVE20 | 20% discount applied | ✅ |
| TC10 | Regular + SAVE10 | 10% discount applied | ✅ |
| TC11 | Invalid coupon | No coupon discount | ✅ |
| TC12 | Missing coupon | Customer discount still applied | ✅ |

## Edge Cases

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC13 | Price = 0 | Returns 0 | ✅ |
| TC14 | Decimal price | Result rounded to 2 decimals | ✅ |

## Error Cases

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC15 | Negative price | Throws "Invalid price" error | ✅ |
| TC16 | Small negative price | Throws "Invalid price" error | ✅ |

## Coverage Areas

- Customer type logic
- Coupon logic
- Coupon priority using `Math.max`
- Price calculation
- Decimal rounding
- Zero price
- Invalid price
- Unknown inputs
- Missing inputs