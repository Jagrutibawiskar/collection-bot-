import { accounts as mockAccounts, apiRoutes, campaigns } from "./data.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const mockTouches = [
  { id: "t1", channel: "whatsapp", direction: "outbound", status: "read", at: "2026-08-28T10:42:00Z", body: "Payment link opened", transcript: null, intent: null },
  { id: "t2", channel: "ai_voice", direction: "outbound", status: "answered", at: "2026-08-28T09:54:00Z", body: null, transcript: "Customer promised to pay by Friday.", intent: "promise_to_pay" },
  { id: "t3", channel: "sms", direction: "outbound", status: "delivered", at: "2026-08-27T08:00:00Z", body: "EMI reminder sent", transcript: null, intent: null }
];

const mockStats = {
  kpis: [
    { label: "Total portfolio", value: "₹21.21 Cr", note: "from uploaded EMI files" },
    { label: "Collected", value: "₹4.27 Cr", note: "payment success stops automation" },
    { label: "Outstanding", value: "₹16.94 Cr", note: "active + overdue balance" },
    { label: "Overdue queue", value: "991", note: "manager handoff pending" }
  ],
  chartBars: [38, 44, 49, 52, 58, 63, 71, 66, 76, 82, 87, 91],
  funnelStages: [
    { label: "D-7 WhatsApp", count: 2270, pct: 100 },
    { label: "D-4 WhatsApp", count: 1640, pct: 72 },
    { label: "D-1 Voice + SMS", count: 1442, pct: 64 },
    { label: "D-Day Voice", count: 1210, pct: 53 },
    { label: "Human queue", count: 991, pct: 44 }
  ],
  attention: [
    { time: "11:12", text: "D-Day AI calls started for 318 customers", tag: "Voice", tone: "open" },
    { time: "10:58", text: "Payment received for Daniel Reed; all sends stopped", tag: "Paid", tone: "paid" },
    { time: "10:31", text: "42 PTP dates captured by AI voice", tag: "PTP", tone: "ptp" },
    { time: "09:54", text: "18 disputes moved to manager review", tag: "Review", tone: "disputed" }
  ],
  campaigns
};

const mockAudit = [
  { id: "AUD-1001", at: "2026-08-28 10:58", actor: "Payment webhook", action: "marked_paid", account: "MHF-1047", detail: "Automation stopped after payment success." },
  { id: "AUD-1002", at: "2026-08-28 10:31", actor: "AI voice", action: "ptp_created", account: "MHF-1043", detail: "Promise to pay captured for 2026-08-30." },
  { id: "AUD-1003", at: "2026-08-28 09:54", actor: "Manager", action: "dispute_flagged", account: "BAJ-1045", detail: "Customer disputed amount and automated contact paused." }
];

function withQuery(path, params = {}) {
  const clean = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!clean.length) return path;
  const query = new URLSearchParams(clean).toString();
  return `${path}?${query}`;
}

async function request(path, options = {}, fallback) {
  if (!API_BASE_URL) return fallback;
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.warn(`Using mock data for ${path}`, error);
    return fallback;
  }
}

export const endpoints = apiRoutes;

export function getStats(params = {}) {
  return request(withQuery(apiRoutes.stats, params), {}, mockStats);
}

export function getAccounts(params = {}) {
  return request(withQuery(apiRoutes.accounts, params), {}, { data: mockAccounts, meta: { page: 1, per_page: 50, total: mockAccounts.length } });
}

export async function getAccount(id) {
  const fallback = mockAccounts.find(account => account.id === id) || null;
  return request(apiRoutes.accountDetail.replace(":id", id), {}, fallback);
}

export function patchAccount(id, patch) {
  return request(apiRoutes.accountDetail.replace(":id", id), { method: "PATCH", body: JSON.stringify(patch) }, { id, ...patch });
}

export function getAccountTouches(id) {
  return request(apiRoutes.accountTouches.replace(":id", id), {}, { data: mockTouches, meta: { total: mockTouches.length } });
}

export function createImport(file) {
  const fallback = { id: "IMP-DEMO-1", status: "uploaded", filename: file?.name || "demo-ledger.xlsx" };
  if (!API_BASE_URL) return Promise.resolve(fallback);
  const form = new FormData();
  if (file) form.append("file", file);
  return request(apiRoutes.imports, { method: "POST", headers: {}, body: form }, fallback);
}

export function saveImportMapping(id, mapping) {
  return request(apiRoutes.importMapping.replace(":id", id), { method: "POST", body: JSON.stringify({ mapping }) }, { id, mapping, status: "mapped" });
}

export function getImportJob(id) {
  return request(apiRoutes.importJob.replace(":id", id), {}, { id, status: "parsed", ready_rows: 4182, bad_rows: 61, duplicates: 12 });
}

export function getCampaigns() {
  return request(apiRoutes.campaigns, {}, { data: campaigns, meta: { total: campaigns.length } });
}

export function saveCampaignRules(rules) {
  return request(apiRoutes.campaigns, { method: "PUT", body: JSON.stringify({ rules }) }, { rules, status: "saved" });
}

export function simulateCampaign(payload) {
  return request(apiRoutes.campaignSimulate, { method: "POST", body: JSON.stringify(payload) }, { sms: 1204, whatsapp: 380, voice: 210, bot_calls: 61, estimated_cost: 8420 });
}

export function getWorklist(params = {}) {
  const data = mockAccounts.filter(account => account.offset > 0 || ["escalated", "disputed", "ptp"].includes(account.lifecycle));
  return request(withQuery(apiRoutes.worklist, params), {}, { data, meta: { total: data.length } });
}

export function saveCallDisposition(id, disposition) {
  return request(apiRoutes.callDisposition.replace(":id", id), { method: "POST", body: JSON.stringify(disposition) }, { id, disposition, status: "saved" });
}

export function getReports(params = {}) {
  return request(withQuery(apiRoutes.reports, params), {}, { data: [], meta: { queued: false } });
}

export function getAudit(params = {}) {
  return request(withQuery(apiRoutes.audit, params), {}, { data: mockAudit, meta: { total: mockAudit.length } });
}

export function getPortal(params = {}) {
  return request(withQuery(apiRoutes.portal, params), {}, { stats: mockStats, accounts: mockAccounts.filter(account => account.client === "L&T Finance") });
}
