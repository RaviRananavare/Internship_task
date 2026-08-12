# Password Strength Checker

A JavaScript password strength checker that evaluates passwords based on length, character variety, and common password detection.

## Features

- Checks minimum password length
- Checks for uppercase letters
- Checks for lowercase letters
- Checks for numbers
- Checks for special characters
- Detects common passwords
- Provides specific feedback
- Calculates a password score
- Returns a strength rating

## Scoring

| Criteria | Points |
|---|---:|
| Length >= 8 | +1 |
| Length >= 12 | +2 |
| Uppercase letter | +1 |
| Lowercase letter | +1 |
| Number | +1 |
| Special character | +1 |
| Not a common password | +1 |

## Ratings

| Score | Rating |
|---|---|
| 0-2 | Weak |
| 3-4 | Fair |
| 5-6 | Good |
| 7 | Strong |

## Example

```javascript
const checkPasswordStrength = require("./passwordStrength");

const result = checkPasswordStrength("Abcdefghij1!");

console.log(result);