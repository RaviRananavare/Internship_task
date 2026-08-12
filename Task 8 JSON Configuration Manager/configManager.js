const fs = require("fs");
const path = require("path");

class ConfigManager {
  constructor(initial = {}) {
    if (
      !initial ||
      typeof initial !== "object" ||
      Array.isArray(initial)
    ) {
      throw new TypeError("Initial configuration must be an object");
    }

    this.data = this._interpolate(initial);
  }

  load(file) {
    if (typeof file !== "string" || !file.trim()) {
      throw new TypeError(
        "Configuration file path must be a non-empty string"
      );
    }

    let x;

    try {
      x = JSON.parse(
        fs.readFileSync(path.resolve(file), "utf8")
      );
    } catch (e) {
      throw new Error(`Unable to load configuration: ${e.message}`);
    }

    if (
      !x ||
      typeof x !== "object" ||
      Array.isArray(x)
    ) {
      throw new Error(
        "Configuration root must be a JSON object"
      );
    }

    this.data = this._interpolate(x);
    return this;
  }

  get(key, def) {
    if (typeof key !== "string" || !key) {
      throw new TypeError(
        "Configuration key must be a non-empty string"
      );
    }

    let v = this.data;

    for (const p of key.split(".")) {
      if (
        v === null ||
        typeof v !== "object" ||
        !Object.prototype.hasOwnProperty.call(v, p)
      ) {
        return def;
      }

      v = v[p];
    }

    return v;
  }

  set(key, value) {
    if (typeof key !== "string" || !key) {
      throw new TypeError(
        "Configuration key must be a non-empty string"
      );
    }

    const a = key.split(".");
    let v = this.data;

    for (let i = 0; i < a.length - 1; i++) {
      if (
        !v[a[i]] ||
        typeof v[a[i]] !== "object" ||
        Array.isArray(v[a[i]])
      ) {
        v[a[i]] = {};
      }

      v = v[a[i]];
    }

    v[a[a.length - 1]] = value;

    return this;
  }

  validate(schema) {
    const errors = [];

    if (
      !schema ||
      typeof schema !== "object" ||
      Array.isArray(schema)
    ) {
      return {
        valid: false,
        errors: ["Schema must be an object"]
      };
    }

    const walk = (v, r, p) => {
      if (
        !r ||
        typeof r !== "object" ||
        Array.isArray(r)
      ) {
        errors.push(`${p}: invalid schema definition`);
        return;
      }

      const exists = v !== undefined && v !== null;

      if (r.required && !exists) {
        errors.push(`${p}: is required`);
        return;
      }

      if (!exists) {
        return;
      }

      if (r.type) {
        const ok =
          r.type === "array"
            ? Array.isArray(v)
            : r.type === "object"
              ? v !== null &&
                typeof v === "object" &&
                !Array.isArray(v)
              : typeof v === r.type;

        if (!ok) {
          errors.push(`${p}: must be a ${r.type}`);
          return;
        }
      }

      if (typeof v === "string") {
        if (
          r.min !== undefined &&
          v.length < r.min
        ) {
          errors.push(
            `${p}: length must be at least ${r.min}`
          );
        }

        if (
          r.max !== undefined &&
          v.length > r.max
        ) {
          errors.push(
            `${p}: length must be at most ${r.max}`
          );
        }
      }

      if (typeof v === "number") {
        if (!Number.isFinite(v)) {
          errors.push(`${p}: must be a finite number`);
        }

        if (
          r.min !== undefined &&
          v < r.min
        ) {
          errors.push(
            `${p}: must be at least ${r.min}`
          );
        }

        if (
          r.max !== undefined &&
          v > r.max
        ) {
          errors.push(
            `${p}: must be at most ${r.max}`
          );
        }
      }

      if (
        r.properties &&
        v &&
        typeof v === "object" &&
        !Array.isArray(v)
      ) {
        for (const [k, cr] of Object.entries(
          r.properties
        )) {
          walk(
            v[k],
            cr,
            p ? `${p}.${k}` : k
          );
        }
      }
    };

    for (const [k, r] of Object.entries(schema)) {
      walk(this.data[k], r, k);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  _interpolate(v) {
    if (typeof v === "string") {
      const exact = v.match(
        /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/
      );

      if (exact) {
        return process.env[exact[1]] !== undefined
          ? process.env[exact[1]]
          : v;
      }

      return v.replace(
        /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g,
        (m, n) =>
          process.env[n] !== undefined
            ? process.env[n]
            : m
      );
    }

    if (Array.isArray(v)) {
      return v.map((x) => this._interpolate(x));
    }

    if (v && typeof v === "object") {
      return Object.fromEntries(
        Object.entries(v).map(([k, x]) => [
          k,
          this._interpolate(x)
        ])
      );
    }

    return v;
  }
}

module.exports = ConfigManager;
module.exports.ConfigManager = ConfigManager;