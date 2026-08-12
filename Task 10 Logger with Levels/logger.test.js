const fs = require("fs");
const os = require("os");
const path = require("path");
const Logger = require("./logger");

describe("Logger with Levels", () => {
  let f;

  beforeEach(() => {
    f = path.join(
      os.tmpdir(),
      `log-${Date.now()}-${Math.random()}.log`
    );
  });

  afterEach(() => {
    for (const x of [f, `${f}.1`]) {
      if (fs.existsSync(x)) {
        fs.unlinkSync(x);
      }
    }

    jest.restoreAllMocks();
  });

  test("info", () => {
    const s = jest.spyOn(console, "log").mockImplementation(() => {});

    const r = new Logger({ level: "INFO" }).info("User", { id: 1 });

    expect(r.level).toBe("INFO");
    expect(s).toHaveBeenCalled();
  });

  test("debug", () => {
    const s = jest.spyOn(console, "log").mockImplementation(() => {});

    new Logger({ level: "DEBUG" }).debug("Query");

    expect(s.mock.calls[0][0]).toContain("DEBUG");
  });

  test("filters debug", () => {
    const s = jest.spyOn(console, "log").mockImplementation(() => {});

    expect(new Logger({ level: "INFO" }).debug("hidden")).toBeNull();
    expect(s).not.toHaveBeenCalled();
  });

  test("warn", () => {
    const s = jest.spyOn(console, "warn").mockImplementation(() => {});

    new Logger({ level: "WARN" }).warn("warning");

    expect(s).toHaveBeenCalled();
  });

  test("error", () => {
    const s = jest.spyOn(console, "error").mockImplementation(() => {});

    new Logger({ level: "ERROR" }).error("bad");

    expect(s).toHaveBeenCalled();
  });

  test("setLevel", () => {
    const s = jest.spyOn(console, "log").mockImplementation(() => {});

    const l = new Logger({ level: "ERROR" });

    l.setLevel("DEBUG").debug("visible");

    expect(s).toHaveBeenCalled();
  });

  test("timestamp metadata", () => {
    const s = jest.spyOn(console, "log").mockImplementation(() => {});

    const r = new Logger().info("hello", { id: 1 });

    expect(r.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(s.mock.calls[0][0]).toContain("id");
  });

  test("json format", () => {
    const s = jest.spyOn(console, "log").mockImplementation(() => {});

    new Logger({ format: "json" }).info("hello", { id: 1 });

    expect(JSON.parse(s.mock.calls[0][0]).metadata.id).toBe(1);
  });

  test("file transport", () => {
    new Logger({
      transports: ["file"],
      file: f
    }).info("file message");

    expect(fs.readFileSync(f, "utf8")).toContain("file message");
  });

  test("console and file", () => {
    const s = jest.spyOn(console, "log").mockImplementation(() => {});

    new Logger({
      transports: ["console", "file"],
      file: f
    }).info("both");

    expect(s).toHaveBeenCalled();
    expect(fs.readFileSync(f, "utf8")).toContain("both");
  });

  test("rotation", () => {
    fs.writeFileSync(f, "x".repeat(20));

    new Logger({
      transports: ["file"],
      file: f,
      maxFileSize: 20
    }).info("rotate");

    expect(fs.existsSync(f + ".1")).toBe(true);
  });

  test("structured return", () => {
    const s = jest.spyOn(console, "log").mockImplementation(() => {});

    expect(new Logger().info("x")).toEqual(
      expect.objectContaining({
        level: "INFO",
        message: "x",
        metadata: {}
      })
    );
  });

  test("bad level", () => {
    expect(() => new Logger({ level: "TRACE" })).toThrow(
      "Unsupported log level"
    );
  });

  test("bad format", () => {
    expect(() => new Logger({ format: "xml" })).toThrow("Format");
  });

  test("file needs path", () => {
    expect(() =>
      new Logger({ transports: ["file"] }).info("x")
    ).toThrow("file path");
  });

  test("case insensitive", () => {
    const s = jest.spyOn(console, "log").mockImplementation(() => {});

    new Logger({ level: "debug" }).info("x");

    expect(s).toHaveBeenCalled();
  });
});