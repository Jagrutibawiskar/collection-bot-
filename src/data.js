export const apiRoutes = {
  login: "/api/auth/login",
  stats: "/api/stats",
  imports: "/api/imports",
  importJob: "/api/imports/:id",
  importMapping: "/api/imports/:id/mapping",
  accounts: "/api/accounts",
  accountDetail: "/api/accounts/:id",
  accountTouches: "/api/accounts/:id/touches",
  campaigns: "/api/campaigns",
  campaignSimulate: "/api/campaigns/simulate",
  worklist: "/api/worklist",
  callDisposition: "/api/calls/:id/disposition",
  reports: "/api/reports",
  audit: "/api/audit",
  portal: "/api/portal",
  paymentsWebhook: "/api/webhooks/payment-success"
};

export const accounts = [
  { id: "LAN-2042", name: "Riya Sharma", mobile: "+91 98765 42042", client: "L&T Finance", amount: 1500000, paidAmount: 250000, remainingBalance: 1250000, emiAmount: 250000, due: "2026-08-21", offset: 7, stage: 5, lifecycle: "escalated", channel: "agent", agent: "A. Khan", campaign: "August Two Wheeler EMI", totalEmis: 24, pendingEmis: 5, insurance: 18000, serviceTax: 2250, fine: 1200, zone: "red", ptpDate: "2026-08-29" },
  { id: "MHF-1043", name: "Marcus Lee", mobile: "+91 98765 41043", client: "Mahindra Finance", amount: 840000, paidAmount: 420000, remainingBalance: 420000, emiAmount: 70000, due: "2026-08-27", offset: 1, stage: 4, lifecycle: "ptp", channel: "ai_voice", agent: "Unassigned", campaign: "NACH Bounce Follow-up", totalEmis: 18, pendingEmis: 6, insurance: 9600, serviceTax: 980, fine: 300, zone: "white", ptpDate: "2026-08-30" },
  { id: "TVS-1044", name: "Nisha Patel", mobile: "+91 98765 41044", client: "TVS Credit", amount: 2250000, paidAmount: 900000, remainingBalance: 1350000, emiAmount: 112500, due: "2026-08-28", offset: 0, stage: 3, lifecycle: "open", channel: "voice", agent: "Unassigned", campaign: "September Tractor EMI", totalEmis: 30, pendingEmis: 12, insurance: 24000, serviceTax: 1800, fine: 0, zone: "white" },
  { id: "BAJ-1045", name: "Oliver Grant", mobile: "+91 98765 41045", client: "Bajaj Finance", amount: 990000, paidAmount: 180000, remainingBalance: 810000, emiAmount: 90000, due: "2026-08-17", offset: 11, stage: 5, lifecycle: "disputed", channel: "agent", agent: "M. Stone", campaign: "Commercial Vehicle Bucket 1", totalEmis: 12, pendingEmis: 9, insurance: 15000, serviceTax: 1120, fine: 2400, zone: "red" },
  { id: "LAN-1046", name: "Fatima Noor", mobile: "+91 98765 41046", client: "L&T Finance", amount: 470000, paidAmount: 94000, remainingBalance: 376000, emiAmount: 47000, due: "2026-08-29", offset: -1, stage: 3, lifecycle: "open", channel: "voice", agent: "Unassigned", campaign: "August Two Wheeler EMI", totalEmis: 10, pendingEmis: 8, insurance: 5200, serviceTax: 520, fine: 0, zone: "pre" },
  { id: "MHF-1047", name: "Daniel Reed", mobile: "+91 98765 41047", client: "Mahindra Finance", amount: 1830000, paidAmount: 1830000, remainingBalance: 0, emiAmount: 91500, due: "2026-08-25", offset: 3, stage: 6, lifecycle: "paid", channel: "whatsapp", agent: "Closed", campaign: "NACH Bounce Follow-up", totalEmis: 20, pendingEmis: 0, insurance: 21000, serviceTax: 1600, fine: 0, zone: "green" }
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

export const campaigns = [
  { name: "August Two Wheeler EMI", file: "aug-two-wheeler.xlsx", customers: 4182, paid: 1196, whatsapp: 1640, voice: 840, human: 506, value: 1020000000 },
  { name: "NACH Bounce Follow-up", file: "nach-bounce-live.xlsx", customers: 1280, paid: 312, whatsapp: 420, voice: 318, human: 230, value: 386000000 },
  { name: "Commercial Vehicle Bucket 1", file: "cv-bucket-one.xlsx", customers: 890, paid: 141, whatsapp: 210, voice: 284, human: 255, value: 715000000 }
];

export const nav = [
  { label: "Dashboard", key: "dashboard", screen: "S2", icon: "▦", roles: ["ops_admin"] },
  { label: "Import", key: "import", screen: "S3", icon: "⇧", roles: ["ops_admin", "client"] },
  { label: "Accounts", key: "accounts", screen: "S4", icon: "☰", roles: ["ops_admin"] },
  { label: "Campaigns", key: "campaigns", screen: "S6", icon: "◎", roles: ["ops_admin"] },
  { label: "Reports", key: "reports", screen: "S10", icon: "◫", roles: ["ops_admin", "client"] },
  { label: "Worklist", key: "worklist", screen: "S7", icon: "☎", roles: ["agent"] },
  { label: "Portal", key: "portal", screen: "S9", icon: "◱", roles: ["client"] },
  { label: "Audit", key: "audit", screen: "S11", icon: "◇", roles: ["ops_admin"] },
  { label: "Settings", key: "settings", screen: "S12", icon: "⚙", roles: ["ops_admin"] }
];

export const journeySteps = [
  ["D-7", "WhatsApp + payment link"],
  ["D-4", "WhatsApp reminder"],
  ["D-1", "AI voice + WA + SMS"],
  ["D-Day", "AI voice + WA + SMS"],
  ["Paid", "Stop automation"],
  ["Overdue", "Manager handoff"]
];

export function money(minor, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(minor / 100);
}

export function dayOffsetLabel(offset) {
  if (offset > 0) return `D+${offset}`;
  if (offset === 0) return "D-Day";
  return `D${offset}`;
}

export function zoneClass(account) {
  if (account.lifecycle === "paid") return "green";
  if (account.offset >= 8) return "red";
  if (account.offset >= 3) return "orange";
  if (account.offset > 0) return "white";
  return "pre";
}







