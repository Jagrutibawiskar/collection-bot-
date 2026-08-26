// Dummy auth layer. Swap these functions for real /api/auth calls later.
const DEMO_USERS = [
  { email: "demo@cegura.io", password: "demo1234", name: "Admin Khan", role: "Operations lead", initials: "AK", tenant: "Acme Utilities" },
  { email: "agent@cegura.io", password: "agent1234", name: "M. Stone", role: "Recovery agent", initials: "MS", tenant: "Metro Telecom" }
];

export const demoCredentials = { email: "demo@cegura.io", password: "demo1234" };

const STORAGE_KEY = "cegura.session";

function nameFromEmail(email) {
  const handle = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return handle.replace(/\b\w/g, c => c.toUpperCase()) || "New User";
}

function initialsFrom(name) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* storage blocked, session stays in memory only */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clean up */
  }
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function signIn({ email, password }) {
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  if (!password) return { error: "Password is required." };

  const match = DEMO_USERS.find(u => u.email === email.trim().toLowerCase());
  if (match) {
    if (match.password !== password) return { error: "Wrong password for this demo account." };
    const { password: _pw, ...user } = match;
    return { user };
  }

  // Demo mode: any other email works with a 8+ char password.
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  const name = nameFromEmail(email);
  return {
    user: { email: email.trim().toLowerCase(), name, role: "Operations lead", initials: initialsFrom(name), tenant: "Acme Utilities" }
  };
}

export function signUp({ name, email, password, confirm }) {
  if (!name.trim()) return { error: "Full name is required." };
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  return {
    user: { email: email.trim().toLowerCase(), name: name.trim(), role: "Operations lead", initials: initialsFrom(name.trim()), tenant: "Acme Utilities" }
  };
}

export function ssoSignIn(provider) {
  return {
    user: { email: "demo@cegura.io", name: "Admin Khan", role: `Operations lead · ${provider}`, initials: "AK", tenant: "Acme Utilities" }
  };
}
