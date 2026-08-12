const EventEmitter = require("./eventEmitter");

describe("Event Emitter System", () => {
  test("on and emit", async () => {
    const e = new EventEmitter();
    const h = jest.fn();

    e.on("user.created", h);

    await e.emit("user.created", { id: 1 });

    expect(h).toHaveBeenCalledWith({ id: 1 });
  });

  test("multiple listeners", async () => {
    const e = new EventEmitter();
    const a = jest.fn();
    const b = jest.fn();

    e.on("x", a).on("x", b);

    await e.emit("x", 1);

    expect(a).toHaveBeenCalledWith(1);
    expect(b).toHaveBeenCalledWith(1);
  });

  test("once", async () => {
    const e = new EventEmitter();
    const h = jest.fn();

    e.once("x", h);

    await e.emit("x");
    await e.emit("x");

    expect(h).toHaveBeenCalledTimes(1);
  });

  test("off", async () => {
    const e = new EventEmitter();
    const h = jest.fn();

    e.on("x", h).off("x", h);

    await e.emit("x");

    expect(h).not.toHaveBeenCalled();
  });

  test("wildcard", async () => {
    const e = new EventEmitter();
    const h = jest.fn();

    e.on("user.*", h);

    await e.emit("user.created", 1);

    expect(h).toHaveBeenCalledWith(1);
  });

  test("wildcard depth", async () => {
    const e = new EventEmitter();
    const h = jest.fn();

    e.on("user.*", h);

    await e.emit("user.profile.updated");

    expect(h).not.toHaveBeenCalled();
  });

  test("middle wildcard", async () => {
    const e = new EventEmitter();
    const h = jest.fn();

    e.on("user.*.updated", h);

    await e.emit("user.profile.updated");

    expect(h).toHaveBeenCalled();
  });

  test("async handler awaited", async () => {
    const e = new EventEmitter();
    const a = [];

    e.on("x", async () => {
      await new Promise((r) => setTimeout(r, 1));
      a.push(1);
    });

    await e.emit("x");

    expect(a).toEqual([1]);
  });

  test("returns results", async () => {
    const e = new EventEmitter();

    e.on("x", async () => 1).on("x", async () => 2);

    await expect(e.emit("x")).resolves.toEqual([1, 2]);
  });

  test("errors reject", async () => {
    const e = new EventEmitter();

    e.on("x", () => {
      throw new Error("boom");
    });

    await expect(e.emit("x")).rejects.toThrow("boom");
  });

  test("error handler", async () => {
    const e = new EventEmitter();
    const h = jest.fn();

    e.on("error", h).on("x", () => {
      throw new Error("boom");
    });

    await e.emit("x");

    expect(h).toHaveBeenCalled();
  });

  test("listeners", () => {
    const e = new EventEmitter();
    const a = jest.fn();
    const b = jest.fn();

    e.on("user.created", a).on("user.*", b);

    expect(e.listeners("user.created")).toEqual([a, b]);
  });

  test("remove one event", async () => {
    const e = new EventEmitter();
    const a = jest.fn();
    const b = jest.fn();

    e.on("a", a).on("b", b).removeAllListeners("a");

    await e.emit("a");
    await e.emit("b");

    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });

  test("remove all", async () => {
    const e = new EventEmitter();
    const h = jest.fn();

    e.on("a", h).on("b", h).removeAllListeners();

    await e.emit("a");
    await e.emit("b");

    expect(h).not.toHaveBeenCalled();
  });

  test("bad event", () =>
    expect(() => new EventEmitter().on("", jest.fn())).toThrow("Event name"));

  test("bad handler", () =>
    expect(() => new EventEmitter().on("x", "bad")).toThrow("Handler"));

  test("once wildcard", async () => {
    const e = new EventEmitter();
    const h = jest.fn();

    e.once("user.*", h);

    await e.emit("user.created");
    await e.emit("user.deleted");

    expect(h).toHaveBeenCalledTimes(1);
  });
});