const rateLimit = require("./rateLimiter");

function createRequest(ip = "127.0.0.1") {
  return {
    ip,
    socket: {
      remoteAddress: ip
    },
    headers: {}
  };
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    setHeader: jest.fn(),
    status: jest.fn(function (code) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function (data) {
      this.body = data;
      return this;
    }),
    end: jest.fn(function (message) {
      this.body = message;
    })
  };
}

describe("Rate Limiter", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-10T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("allows requests within the limit", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 3
    });

    const req = createRequest("192.168.1.1");
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  test("sets X-RateLimit-Limit header", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 100
    });

    const req = createRequest();
    const res = createResponse();

    middleware(req, res, jest.fn());

    expect(res.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Limit",
      100
    );
  });

  test("sets remaining requests header", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 100
    });

    const req = createRequest();
    const res = createResponse();

    middleware(req, res, jest.fn());

    expect(res.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Remaining",
      99
    );
  });

  test("sets reset header", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 100
    });

    const req = createRequest();
    const res = createResponse();

    middleware(req, res, jest.fn());

    expect(res.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Reset",
      expect.any(Number)
    );
  });

  test("decreases remaining requests", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 3
    });

    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Remaining",
      2
    );

    middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Remaining",
      1
    );
  });

  test("allows exactly the maximum number of requests", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 3
    });

    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);
    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(3);
  });

  test("blocks requests after the limit", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 2
    });

    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);
    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.statusCode).toBe(429);
  });

  test("returns rate limit error message", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 1
    });

    const req = createRequest();
    const res = createResponse();

    middleware(req, res, jest.fn());
    middleware(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later."
    });
  });

  test("remaining requests becomes zero when limit is reached", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 3
    });

    const req = createRequest("192.168.1.10");
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);
    middleware(req, res, next);
    middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Remaining",
      0
    );
  });

  test("tracks different IP addresses separately", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 1
    });

    const req1 = createRequest("192.168.1.1");
    const req2 = createRequest("192.168.1.2");

    const res1 = createResponse();
    const res2 = createResponse();

    const next1 = jest.fn();
    const next2 = jest.fn();

    middleware(req1, res1, next1);
    middleware(req2, res2, next2);

    expect(next1).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenCalledTimes(1);
  });

  test("uses x-forwarded-for when IP is unavailable", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 1
    });

    const req = {
      headers: {
        "x-forwarded-for": "10.0.0.1"
      },
      socket: {}
    };

    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.statusCode).toBe(429);
  });

  test("uses socket address when other IP information is unavailable", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 1
    });

    const req = {
      headers: {},
      socket: {
        remoteAddress: "10.0.0.2"
      }
    };

    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.statusCode).toBe(429);
  });

  test("resets the request count after the window expires", () => {
    const middleware = rateLimit({
      windowMs: 60000,
      max: 1
    });

    const req = createRequest("192.168.1.20");
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(60001);

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
  });

  test("uses default configuration when options are empty", () => {
    const middleware = rateLimit({});

    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();

    expect(res.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Limit",
      100
    );
  });
});