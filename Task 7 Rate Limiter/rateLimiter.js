function rateLimit(options = {}) {
  const windowMs = options.windowMs || 60000;
  const max = options.max || 100;

  const clients = new Map();

  return function rateLimitMiddleware(req, res, next) {
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown";

    const now = Date.now();

    let client = clients.get(ip);

    if (!client || now >= client.resetTime) {
      client = {
        count: 0,
        resetTime: now + windowMs
      };

      clients.set(ip, client);
    }

    client.count += 1;

    const remaining = Math.max(0, max - client.count);
    const reset = Math.ceil(client.resetTime / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);

    if (client.count > max) {
      res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later."
      });
      return;
    }

    next();
  };
}

module.exports = rateLimit;