const fs = require("fs");
const path = require("path");

const LEVELS = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40
};

class Logger {
  constructor(options = {}) {
    this.level = this._level(options.level || "INFO");
    this.format = options.format || "pretty";
    this.transports = options.transports || ["console"];
    this.file = options.file || null;
    this.maxFileSize = options.maxFileSize || 0;

    if (!["pretty", "json"].includes(this.format)) {
      throw new TypeError("Format must be 'pretty' or 'json'");
    }

    if (!Array.isArray(this.transports)) {
      throw new TypeError("Transports must be an array");
    }
  }

  setLevel(level) {
    this.level = this._level(level);
    return this;
  }

  debug(message, metadata = {}) {
    return this.log("DEBUG", message, metadata);
  }

  info(message, metadata = {}) {
    return this.log("INFO", message, metadata);
  }

  warn(message, metadata = {}) {
    return this.log("WARN", message, metadata);
  }

  error(message, metadata = {}) {
    return this.log("ERROR", message, metadata);
  }

  log(level, message, metadata = {}) {
    level = this._level(level);

    if (LEVELS[level] < LEVELS[this.level]) {
      return null;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message: String(message),
      metadata:
        metadata && typeof metadata === "object"
          ? metadata
          : { value: metadata }
    };

    const output =
      this.format === "json"
        ? JSON.stringify(entry)
        : `[${entry.timestamp}] ${entry.level}: ${entry.message}${
            Object.keys(entry.metadata).length
              ? ` ${JSON.stringify(entry.metadata)}`
              : ""
          }`;

    for (const transport of this.transports) {
      if (transport === "console") {
        if (level === "ERROR") {
          console.error(output);
        } else if (level === "WARN") {
          console.warn(output);
        } else {
          console.log(output);
        }
      } else if (transport === "file") {
        this._file(output);
      } else {
        throw new Error(`Unsupported transport: ${transport}`);
      }
    }

    return entry;
  }

  _file(output) {
    if (!this.file) {
      throw new Error("A file path is required for the file transport");
    }

    const filePath = path.resolve(this.file);

    fs.mkdirSync(path.dirname(filePath), {
      recursive: true
    });

    if (
      this.maxFileSize > 0 &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).size +
        Buffer.byteLength(output + "\n") >
        this.maxFileSize
    ) {
      this._rotate(filePath);
    }

    fs.appendFileSync(filePath, output + "\n", "utf8");
  }

  _rotate(filePath) {
    const rotatedFile = filePath + ".1";

    if (fs.existsSync(rotatedFile)) {
      fs.unlinkSync(rotatedFile);
    }

    if (fs.existsSync(filePath)) {
      fs.renameSync(filePath, rotatedFile);
    }
  }

  _level(level) {
    if (typeof level !== "string") {
      throw new TypeError("Log level must be a string");
    }

    level = level.toUpperCase();

    if (!Object.prototype.hasOwnProperty.call(LEVELS, level)) {
      throw new Error(`Unsupported log level: ${level}`);
    }

    return level;
  }
}

module.exports = Logger;
module.exports.Logger = Logger;
module.exports.LEVELS = LEVELS;