const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Turns a number (like a database id) into a short base62 string.
export function toBase62(num) {
  let n = BigInt(num);
  if (n === 0n) return "0";
  let out = "";
  while (n > 0n) {
    out = ALPHABET[Number(n % 62n)] + out;
    n = n / 62n;
  }
  return out;
}

// Words that would clash with our own pages.
export const RESERVED = ["api", "stats", "_next", "favicon.ico"];

export const ALIAS_PATTERN = /^[A-Za-z0-9_-]{3,30}$/;

export function parseDevice(userAgent = "") {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobi|android|iphone/.test(ua)) return "mobile";
  return "desktop";
}

export function parseReferrer(referer) {
  if (!referer) return "direct";
  try {
    return new URL(referer).hostname;
  } catch {
    return "direct";
  }
}
