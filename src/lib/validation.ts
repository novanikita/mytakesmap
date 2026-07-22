const RESERVED = new Set([
  "login",
  "register",
  "api",
  "me",
  "settings",
  "admin",
  "www",
  "covers",
  "favicon",
  "icon",
  "demo",
  "about",
  "help",
  "support",
  "null",
  "undefined",
]);

/** lowercase letters, digits, underscore; 3–24 chars */
const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsername(raw: string): string | null {
  const username = normalizeUsername(raw);
  if (!USERNAME_RE.test(username)) {
    return "Username: 3–24 chars, a–z, 0–9, underscore only";
  }
  if (RESERVED.has(username)) {
    return "This username is reserved";
  }
  return null;
}

export function validateEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email";
  }
  return null;
}

export function validatePassword(raw: string): string | null {
  if (raw.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}
