const express = require("express");

const app = express();
const PORT = 3000;

// Allow JSON request bodies
app.use(express.json());

// In-memory URL storage
const urlStore = new Map();

// Generate a random 6-character code
function generateShortCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return code;
}

// Validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// POST /shorten
app.post("/shorten", (req, res) => {
  const { url, alias } = req.body;

  // Validate URL
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({
      error: "A valid URL is required",
    });
  }

  // Handle custom alias
  if (alias) {
    if (urlStore.has(alias)) {
      return res.status(409).json({
        error: "Alias already exists",
      });
    }

    urlStore.set(alias, {
      originalUrl: url,
      clicks: 0,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      shortCode: alias,
      shortUrl: `http://localhost:${PORT}/${alias}`,
      originalUrl: url,
    });
  }

  // Handle duplicate URL submission
  for (const [code, data] of urlStore.entries()) {
    if (data.originalUrl === url) {
      return res.status(200).json({
        shortCode: code,
        shortUrl: `http://localhost:${PORT}/${code}`,
        originalUrl: url,
        message: "URL already shortened",
      });
    }
  }

  // Generate unique code
  let shortCode;

  do {
    shortCode = generateShortCode();
  } while (urlStore.has(shortCode));

  urlStore.set(shortCode, {
    originalUrl: url,
    clicks: 0,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    shortCode,
    shortUrl: `http://localhost:${PORT}/${shortCode}`,
    originalUrl: url,
  });
});

// GET /:code
app.get("/:code", (req, res) => {
  const { code } = req.params;

  const data = urlStore.get(code);

  if (!data) {
    return res.status(404).json({
      error: "Short URL not found",
    });
  }

  data.clicks += 1;

  res.redirect(data.originalUrl);
});

// GET /info/:code
app.get("/info/:code", (req, res) => {
  const { code } = req.params;

  const data = urlStore.get(code);

  if (!data) {
    return res.status(404).json({
      error: "Short URL not found",
    });
  }

  res.json({
    shortCode: code,
    originalUrl: data.originalUrl,
    clicks: data.clicks,
    createdAt: data.createdAt,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`URL Shortener running at http://localhost:${PORT}`);
});

// Export app for testing
module.exports = app;