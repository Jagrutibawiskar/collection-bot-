import { accounts as mockAccounts, apiRoutes } from "./data.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const mockStats = {
  kpis: [
    { label: "Outstanding", value: "£1,284,300", note: "Active accounts only" },
    { label: "Collected MTD", value: "£312,900", note: "▲ 12% vs previous" },
    { label: "Collection rate", value: "24.3%", note: "Paid ÷ assigned" },
    { label: "Cost per collection", value: "£1.86", note: "Channel spend ÷ closed" }
  ],
  chartBars: [55, 64, 58, 72, 66, 80, 77, 82, 86, 91, 88, 96],
  funnelStages: [
    { label: "S1 Reminder", count: 4210, pct: 100 },
    { label: "S2 Pre-due", count: 1684, pct: 40 },
    { label: "S3 Overdue", count: 631, pct: 15 },
    { label: "S4 Escalated", count: 210, pct: 5 }
  ],
  attention: [
    { time: "10:42", text: "Payment received · Riya Sharma · £150.00", tag: "Paid", tone: "paid" },
    { time: "10:31", text: "9 disputes unassigned from AI voice calls", tag: "Review", tone: "disputed" },
    { time: "10:18", text: "3 failed uploads need column fixes", tag: "Import", tone: "open" },
    { time: "09:54", text: "14 promises broken today", tag: "PTP", tone: "ptp" }
  ]
};

async function request(path, fallback) {
  if (!API_BASE_URL) return fallback;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Using mock data for ${path}`, error);
    return fallback;
  }
}

export function getStats() {
  return request(apiRoutes.stats, mockStats);
}

export function getAccounts() {
  return request(apiRoutes.accounts, mockAccounts);
}

export async function getAccount(id) {
  const fallback = mockAccounts.find(account => account.id === id) || null;
  return request(apiRoutes.accountDetail.replace(":id", id), fallback);
}
