export const apiRoutes = {
  stats: "/api/stats",
  imports: "/api/imports",
  importJob: "/api/imports/:id",
  accounts: "/api/accounts",
  accountDetail: "/api/accounts/:id",
  campaigns: "/api/campaigns",
  reports: "/api/reports",
  audit: "/api/audit",
  paymentsWebhook: "/api/webhooks/payment-success"
};

export const accounts = [
  { id: "ACC-1042", name: "Riya Sharma", client: "Acme Utilities", amount: 15000, due: "2026-08-15", offset: 4, stage: 4, lifecycle: "escalated", channel: "agent", agent: "A. Khan" },
  { id: "ACC-1043", name: "Marcus Lee", client: "Acme Utilities", amount: 8400, due: "2026-08-18", offset: 1, stage: 3, lifecycle: "ptp", channel: "ai_voice", agent: "Unassigned" },
  { id: "ACC-1044", name: "Nisha Patel", client: "North Council", amount: 22500, due: "2026-08-19", offset: 0, stage: 2, lifecycle: "open", channel: "whatsapp", agent: "Unassigned" },
  { id: "ACC-1045", name: "Oliver Grant", client: "Metro Telecom", amount: 9900, due: "2026-08-12", offset: 7, stage: 4, lifecycle: "disputed", channel: "voice", agent: "M. Stone" },
  { id: "ACC-1046", name: "Fatima Noor", client: "Acme Utilities", amount: 4700, due: "2026-08-20", offset: -1, stage: 2, lifecycle: "open", channel: "voice", agent: "Unassigned" },
  { id: "ACC-1047", name: "Daniel Reed", client: "Metro Telecom", amount: 18300, due: "2026-08-10", offset: 9, stage: 4, lifecycle: "paid", channel: "whatsapp", agent: "Closed" }
];

export const lifecycleLabels = {
  open: "Open",
  ptp: "Promise to pay",
  disputed: "Disputed",
  escalated: "With agent",
  paid: "Paid",
  unreachable: "Unreachable",
  legal: "Legal"
};

export const nav = [
  { label: "Home", key: "home", screen: "S0", icon: "\u2302" },
  { label: "Dashboard", key: "dashboard", screen: "S2", icon: "\u25A6" },
  { label: "Import", key: "import", screen: "S3", icon: "\u21E7" },
  { label: "Accounts", key: "accounts", screen: "S4", icon: "\u2630" },
  { label: "Campaigns", key: "campaigns", screen: "S6", icon: "\u25CE" },
  { label: "Reports", key: "reports", screen: "S10", icon: "\u25EB" },
  { label: "Worklist", key: "worklist", screen: "S7", icon: "\u260E" },
  { label: "Settings", key: "settings", screen: "S12", icon: "\u2699" }
];

export const journeySteps = [
  ["D-5", "SMS"], ["D-4", "SMS"], ["D-3", "SMS"], ["D-2", "VOICE"], ["D-1", "VOICE + WA"],
  ["D0", "WA + QR"], ["D+1", "BOT + WA"], ["D+2", "BOT + WA"], ["D+3", "BOT + WA"], ["D+4", "AGENT"]
];

export function money(minor, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(minor / 100);
}

export function dayOffsetLabel(offset) {
  if (offset > 0) return `D+${offset}`;
  if (offset === 0) return "D0";
  return `D${offset}`;
}
