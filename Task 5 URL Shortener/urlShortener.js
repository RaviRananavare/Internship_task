const crypto = require("crypto");

const urlStore = new Map();

const CODE_LENGTH = 6;
const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateShortCode() {
  let code = "";

  do {
    code = "";

    const randomBytes = crypto.randomBytes(CODE_LENGTH);

    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CHARACTERS[randomBytes[i] % CHARACTERS.length];
    }
  } while (urlStore.has(code));

  return code;
}

function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);

    return parsedUrl.protocol === "http:" ||
           parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function shortenUrl(longUrl, customAlias = null) {
  if (!isValidUrl(longUrl)) {
    throw new Error("Invalid URL");
  }

  // Handle duplicate URL submissions
  for (const [code, data] of urlStore.entries()) {
    if (data.longUrl === longUrl && !customAlias) {
      return {
        code,
        longUrl: data.longUrl
      };
    }
  }

  let code;

  if (customAlias) {
    if (!/^[A-Za-z0-9]{1,20}$/.test(customAlias)) {
      throw new Error("Invalid custom alias");
    }

    if (urlStore.has(customAlias)) {
      throw new Error("Custom alias already exists");
    }

    code = customAlias;
  } else {
    code = generateShortCode();
  }

  urlStore.set(code, {
    longUrl,
    createdAt: new Date()
  });

  return {
    code,
    longUrl
  };
}

function getOriginalUrl(code) {
  const data = urlStore.get(code);

  if (!data) {
    return null;
  }

  return data.longUrl;
}

function getUrlInfo(code) {
  const data = urlStore.get(code);

  if (!data) {
    return null;
  }

  return {
    code,
    longUrl: data.longUrl,
    createdAt: data.createdAt
  };
}

function clearStore() {
  urlStore.clear();
}

module.exports = {
  shortenUrl,
  getOriginalUrl,
  getUrlInfo,
  generateShortCode,
  clearStore
};