// Frontend auth mock. Replace with /api/auth/login when backend is ready.
const DEMO_USERS = [
  { email: "demo@cegura.io", password: "demo1234", name: "Admin Khan", role: "Operations lead", roleKey: "ops_admin", initials: "AK", tenant: "Acme Utilities", requires2fa: true },
  { email: "agent@cegura.io", password: "agent1234", name: "M. Stone", role: "Recovery agent", roleKey: "agent", initials: "MS", tenant: "Metro Telecom", requires2fa: false },
  { email: "client@cegura.io", password: "client1234", name: "Client Viewer", role: "Client finance", roleKey: "client", initials: "CV", tenant: "L&T Finance", requires2fa: false }
];

export const demoCredentials = { email: "demo@cegura.io", password: "demo1234", otp: "123456" };
export const roleHome = { ops_admin: "/dashboard", agent: "/worklist", client: "/portal" };

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

function publicUser(user) {
  const { password, requires2fa, ...safe } = user;
  return safe;
}

export function signIn({ email, password, otp }) {
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  if (!password) return { error: "Password is required." };

  const match = DEMO_USERS.find(u => u.email === email.trim().toLowerCase());
  if (match) {
    if (match.password !== password) return { error: "Invalid email or password." };
    if (match.requires2fa && otp !== "123456") return { needs2fa: true, error: otp ? "Enter the 6-digit security code." : "Security code required for operations admin." };
    return { user: publicUser(match) };
  }

  if (password.length < 8) return { error: "Invalid email or password." };
  const name = nameFromEmail(email);
  return {
    user: { email: email.trim().toLowerCase(), name, role: "Operations lead", roleKey: "ops_admin", initials: initialsFrom(name), tenant: "Acme Utilities" }
  };
}

export function signUp({ name, email, password, confirm, roleKey = "ops_admin" }) {
  if (!name.trim()) return { error: "Full name is required." };
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  const roleLabel = roleKey === "agent" ? "Recovery agent" : roleKey === "client" ? "Client finance" : "Operations lead";
  return {
    user: { email: email.trim().toLowerCase(), name: name.trim(), role: roleLabel, roleKey, initials: initialsFrom(name.trim()), tenant: "Acme Utilities" }
  };
}

export function ssoSignIn(provider, roleKey = "ops_admin") {
  const roleLabel = roleKey === "agent" ? "Recovery agent" : roleKey === "client" ? "Client finance" : "Operations lead";
  return {
    user: { email: "demo@cegura.io", name: "Admin Khan", role: `${roleLabel} - ${provider}`, roleKey, initials: "AK", tenant: "Acme Utilities" }
  };
}
