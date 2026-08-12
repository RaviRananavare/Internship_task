const checkPasswordStrength = require("./passwordStrength");

describe("Password Strength Checker", () => {

  test("returns Weak for an empty password", () => {
    const result = checkPasswordStrength("");

    expect(result.rating).toBe("Weak");
    expect(result.score).toBe(1);
  });

  test("returns Weak for a password shorter than 8 characters", () => {
    const result = checkPasswordStrength("abc123");

    expect(result.rating).toBe("Weak");
    expect(result.score).toBe(2);
  });

  test("gives feedback when password is too short", () => {
    const result = checkPasswordStrength("Ab1!");

    expect(result.feedback).toContain(
      "Password must be at least 8 characters long"
    );
  });

  test("gives 1 point for password length of 8 characters", () => {
    const result = checkPasswordStrength("Abcdef1!");

    expect(result.score).toBe(6);
  });

  test("gives 2 points for password length of 12 or more", () => {
    const result = checkPasswordStrength("Abcdefghij1!");

    expect(result.score).toBe(7);
    expect(result.rating).toBe("Strong");
  });

  test("gives feedback when uppercase letter is missing", () => {
    const result = checkPasswordStrength("abcdef123!");

    expect(result.feedback).toContain(
      "Add at least one uppercase letter"
    );
  });

  test("gives feedback when lowercase letter is missing", () => {
    const result = checkPasswordStrength("ABCDEF123!");

    expect(result.feedback).toContain(
      "Add at least one lowercase letter"
    );
  });

  test("gives feedback when number is missing", () => {
    const result = checkPasswordStrength("Abcdefgh!");

    expect(result.feedback).toContain(
      "Add at least one number"
    );
  });

  test("gives feedback when special character is missing", () => {
    const result = checkPasswordStrength("Abcdefgh123");

    expect(result.feedback).toContain(
      "Add at least one special character"
    );
  });

  test("detects password as common", () => {
    const result = checkPasswordStrength("password");

    expect(result.feedback).toContain(
      "Avoid using a common password"
    );
  });

  test("detects common password case-insensitively", () => {
    const result = checkPasswordStrength("PASSWORD");

    expect(result.feedback).toContain(
      "Avoid using a common password"
    );
  });

  test("returns Fair for a password with score between 3 and 4", () => {
    const result = checkPasswordStrength("abcdef12");

    expect(result.rating).toBe("Fair");
  });

  test("returns Good for a password with score between 5 and 6", () => {
    const result = checkPasswordStrength("Abcdef12");

    expect(result.rating).toBe("Good");
  });

  test("returns Strong for a password with score 7", () => {
    const result = checkPasswordStrength("Abcdefghij1!");

    expect(result.rating).toBe("Strong");
    expect(result.score).toBe(7);
    expect(result.feedback).toEqual([]);
  });

  test("provides multiple feedback messages for multiple weaknesses", () => {
    const result = checkPasswordStrength("abcdef");

    expect(result.feedback).toContain(
      "Password must be at least 8 characters long"
    );

    expect(result.feedback).toContain(
      "Add at least one uppercase letter"
    );

    expect(result.feedback).toContain(
      "Add at least one special character"
    );
  });

  test("returns Weak when password is not a string", () => {
    const result = checkPasswordStrength(12345678);

    expect(result.rating).toBe("Weak");
    expect(result.score).toBe(0);

    expect(result.feedback).toContain(
      "Password must be a string"
    );
  });

});