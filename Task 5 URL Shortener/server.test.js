const request = require("supertest");
const app = require("./server");

describe("URL Shortener API", () => {
  test("POST /shorten creates a short URL", async () => {
    const response = await request(app)
      .post("/shorten")
      .send({
        url: "https://example.com",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.originalUrl).toBe("https://example.com");
    expect(response.body.shortCode).toHaveLength(6);
    expect(response.body.shortUrl).toContain(response.body.shortCode);
  });

  test("POST /shorten rejects missing URL", async () => {
    const response = await request(app)
      .post("/shorten")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("A valid URL is required");
  });

  test("POST /shorten rejects invalid URL", async () => {
    const response = await request(app)
      .post("/shorten")
      .send({
        url: "not-a-valid-url",
      });

    expect(response.statusCode).toBe(400);
  });

  test("duplicate URL returns existing short URL", async () => {
    const first = await request(app)
      .post("/shorten")
      .send({
        url: "https://duplicate-example.com",
      });

    const second = await request(app)
      .post("/shorten")
      .send({
        url: "https://duplicate-example.com",
      });

    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(200);
    expect(second.body.shortCode).toBe(first.body.shortCode);
    expect(second.body.message).toBe("URL already shortened");
  });

  test("creates URL with custom alias", async () => {
    const response = await request(app)
      .post("/shorten")
      .send({
        url: "https://custom-example.com",
        alias: "custom1",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.shortCode).toBe("custom1");
  });

  test("rejects duplicate custom alias", async () => {
    await request(app)
      .post("/shorten")
      .send({
        url: "https://first-example.com",
        alias: "myalias",
      });

    const response = await request(app)
      .post("/shorten")
      .send({
        url: "https://second-example.com",
        alias: "myalias",
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.error).toBe("Alias already exists");
  });

  test("GET /:code redirects to original URL", async () => {
    const create = await request(app)
      .post("/shorten")
      .send({
        url: "https://redirect-example.com",
      });

    const code = create.body.shortCode;

    const response = await request(app)
      .get(`/${code}`)
      .redirects(0);

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(
      "https://redirect-example.com"
    );
  });

  test("GET /:code returns 404 for unknown code", async () => {
    const response = await request(app)
      .get("/unknown");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Short URL not found");
  });

  test("GET /info/:code returns URL information", async () => {
    await request(app)
      .post("/shorten")
      .send({
        url: "https://info-example.com",
        alias: "info01",
      });

    const response = await request(app)
      .get("/info/info01");

    expect(response.statusCode).toBe(200);
    expect(response.body.shortCode).toBe("info01");
    expect(response.body.originalUrl).toBe(
      "https://info-example.com"
    );
    expect(response.body.clicks).toBe(0);
    expect(response.body.createdAt).toBeDefined();
  });

  test("click tracking increases after redirect", async () => {
    await request(app)
      .post("/shorten")
      .send({
        url: "https://click-example.com",
        alias: "click01",
      });

    await request(app)
      .get("/click01")
      .redirects(0);

    const response = await request(app)
      .get("/info/click01");

    expect(response.body.clicks).toBe(1);
  });

  test("multiple clicks are tracked", async () => {
    await request(app)
      .post("/shorten")
      .send({
        url: "https://multi-click.com",
        alias: "multi01",
      });

    await request(app).get("/multi01").redirects(0);
    await request(app).get("/multi01").redirects(0);
    await request(app).get("/multi01").redirects(0);

    const response = await request(app)
      .get("/info/multi01");

    expect(response.body.clicks).toBe(3);
  });

  test("GET /info/:code returns 404 for unknown code", async () => {
    const response = await request(app)
      .get("/info/notexist");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Short URL not found");
  });
});