const fs = require("fs");
const os = require("os");
const path = require("path");
const ConfigManager = require("./configManager");

describe("JSON Configuration Manager", () => {
  let f;

  beforeEach(() => {
    f = path.join(
      os.tmpdir(),
      `cfg-${Date.now()}-${Math.random()}.json`
    );
  });

  afterEach(() => {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
    }

    delete process.env.DB_HOST;
    delete process.env.NODE_ENV;
  });

  test("gets nested", () => {
    expect(
      new ConfigManager({ a: { b: 1 } }).get("a.b")
    ).toBe(1);
  });

  test("default", () => {
    expect(
      new ConfigManager({}).get("x", 5)
    ).toBe(5);
  });

  test("sets nested", () => {
    expect(
      new ConfigManager({ a: { b: 1 } })
        .set("a.b", 2)
        .get("a.b")
    ).toBe(2);
  });

  test("creates nested", () => {
    expect(
      new ConfigManager({})
        .set("a.b", 2)
        .get("a.b")
    ).toBe(2);
  });

  test("loads json", () => {
    fs.writeFileSync(
      f,
      JSON.stringify({ a: 1 })
    );

    expect(
      new ConfigManager()
        .load(f)
        .get("a")
    ).toBe(1);
  });

  test("interpolates exact env", () => {
    process.env.DB_HOST = "localhost";

    expect(
      new ConfigManager({
        h: "${DB_HOST}"
      }).get("h")
    ).toBe("localhost");
  });

  test("interpolates embedded env", () => {
    process.env.NODE_ENV = "prod";

    expect(
      new ConfigManager({
        n: "app_${NODE_ENV}"
      }).get("n")
    ).toBe("app_prod");
  });

  test("keeps missing env", () => {
    expect(
      new ConfigManager({
        x: "${MISSING_X}"
      }).get("x")
    ).toBe("${MISSING_X}");
  });

  test("interpolates arrays", () => {
    process.env.DB_HOST = "db";

    expect(
      new ConfigManager({
        a: ["${DB_HOST}"]
      }).get("a")[0]
    ).toBe("db");
  });

  test("valid schema", () => {
    expect(
      new ConfigManager({
        db: {
          host: "x",
          port: 5
        }
      }).validate({
        db: {
          type: "object",
          required: true,
          properties: {
            host: {
              type: "string",
              required: true
            },
            port: {
              type: "number",
              min: 1,
              max: 10
            }
          }
        }
      })
    ).toEqual({
      valid: true,
      errors: []
    });
  });

  test("required error", () => {
    expect(
      new ConfigManager({
        db: {}
      }).validate({
        db: {
          type: "object",
          properties: {
            host: {
              type: "string",
              required: true
            }
          }
        }
      }).errors[0]
    ).toContain("db.host");
  });

  test("type error", () => {
    expect(
      new ConfigManager({
        port: "x"
      }).validate({
        port: {
          type: "number"
        }
      }).errors[0]
    ).toContain("must be a number");
  });

  test("invalid root", () => {
    fs.writeFileSync(f, "[]");

    expect(
      () => new ConfigManager().load(f)
    ).toThrow("Configuration root");
  });

  test("invalid schema", () => {
    expect(
      new ConfigManager({})
        .validate(null)
        .valid
    ).toBe(false);
  });
});