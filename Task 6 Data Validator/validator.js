function validate(data, schema) {
  const errors = [];

  // Validate input objects
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      valid: false,
      errors: ["Data must be an object"],
    };
  }

  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return {
      valid: false,
      errors: ["Schema must be an object"],
    };
  }

  for (const field in schema) {
    const rules = schema[field];
    const value = data[field];

    // Required validation
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} is required`);
      continue;
    }

    // Optional missing field
    if (value === undefined || value === null || value === "") {
      continue;
    }

    // String validation
    if (rules.type === "string") {
      if (typeof value !== "string") {
        errors.push(`${field} must be a string`);
        continue;
      }

      if (rules.min !== undefined && value.length < rules.min) {
        errors.push(
          `${field} must be at least ${rules.min} characters long`
        );
      }

      if (rules.max !== undefined && value.length > rules.max) {
        errors.push(
          `${field} must be at most ${rules.max} characters long`
        );
      }
    }

    // Number validation
    else if (rules.type === "number") {
      if (typeof value !== "number" || Number.isNaN(value)) {
        errors.push(`${field} must be a number`);
        continue;
      }

      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }

    // Email validation
    else if (rules.type === "email") {
      if (typeof value !== "string") {
        errors.push(`${field} must be a valid email`);
        continue;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(value)) {
        errors.push(`${field} must be a valid email`);
      }
    }

    // URL validation
    else if (rules.type === "url") {
      if (typeof value !== "string") {
        errors.push(`${field} must be a valid URL`);
        continue;
      }

      try {
        const url = new URL(value);

        if (!["http:", "https:"].includes(url.protocol)) {
          errors.push(`${field} must be a valid URL`);
        }
      } catch {
        errors.push(`${field} must be a valid URL`);
      }
    }

    // Date validation
    else if (rules.type === "date") {
      if (typeof value !== "string") {
        errors.push(`${field} must be a valid ISO date`);
        continue;
      }

      const isoDateRegex =
        /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/;

      if (!isoDateRegex.test(value) || Number.isNaN(Date.parse(value))) {
        errors.push(`${field} must be a valid ISO date`);
      }
    }

    // Unknown type
    else {
      errors.push(`${field} has an unsupported type`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = validate;