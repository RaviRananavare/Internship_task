const commonPasswords = require("./common-passwords");

function checkPasswordStrength(password) {
  const feedback = [];
  let score = 0;

  // Validate input
  if (typeof password !== "string") {
    return {
      score: 0,
      rating: "Weak",
      feedback: ["Password must be a string"]
    };
  }

  // Length
  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Password must be at least 8 characters long");
  }

  // Uppercase
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add at least one uppercase letter");
  }

  // Lowercase
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add at least one lowercase letter");
  }

  // Number
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add at least one number");
  }

  // Special character
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add at least one special character");
  }

  // Common password
  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push("Avoid using a common password");
  } else {
    score += 1;
  }

  // Rating
  let rating;

  if (score <= 2) {
    rating = "Weak";
  } else if (score <= 4) {
    rating = "Fair";
  } else if (score <= 6) {
    rating = "Good";
  } else {
    rating = "Strong";
  }

  return {
    score,
    rating,
    feedback
  };
}

module.exports = checkPasswordStrength;