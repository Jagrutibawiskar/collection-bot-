import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPortal } from "../api.js";
import { lifecycleLabels, money } from "../data.js";
import { Topbar, Kpi, Panel } from "./ui.jsx";

export default function ClientPortal() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("all");
  useEffect(() => { getPortal().then(setData); }, []);
  const accounts = (data?.accounts || []).filter(account => status === "all" || account.lifecycle === status);
  return (
    <>
      <Topbar title="Client Portal" subtitle="Client-scoped recovery dashboard, upload, reports and audit downloads." />
      <div className="portal-actions"><button className="primary" type="button" onClick={() => navigate("/import")}>Upload accounts</button><button className="ghost" type="button" onClick={() => navigate("/reports")}>Download report</button><button className="ghost" type="button" onClick={() => navigate("/audit")}>Audit trail</button></div>
      <section className="grid three"><Kpi label="Submitted" value={(data?.accounts || []).length.toString()} note="client accounts" /><Kpi label="Recovered" value="₹4.27 Cr" note="payments received" /><Kpi label="In progress" value="2,940" note="active campaigns" /></section>
      <section className="grid dashboard-grid" style={{ marginTop: 16 }}><Panel title="Recovery over time" meta="monthly"><div className="chart">{[42, 48, 51, 57, 63, 74, 68, 80].map((h, i) => <div key={i} className="bar" style={{ height: `${h}%` }} />)}</div></Panel><Panel title="Audit & compliance" meta="client-safe"><div className="dashboard-actions"><button className="ghost" type="button">Download audit trail</button><button className="ghost" type="button">Consent records</button><span className="auth-alert ok">Data retention: 24 months</span></div></Panel></section>
      <Panel title="Read-only accounts" meta="client scoped" style={{ marginTop: 16 }}><div className="top-actions" style={{ marginBottom: 12 }}><select className="control" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All status</option>{Object.entries(lifecycleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><div className="table-wrap"><table><thead><tr><th>Customer</th><th>EMI</th><th>Remaining</th><th>Due</th><th>Status</th></tr></thead><tbody>{accounts.map(account => <tr key={account.id}><td><strong>{account.name}</strong><div className="muted">{account.id}</div></td><td>{money(account.emiAmount)}</td><td>{money(account.remainingBalance)}</td><td>{account.due}</td><td><span className={`pill ${account.lifecycle}`}>{lifecycleLabels[account.lifecycle]}</span></td></tr>)}</tbody></table></div></Panel>
    </>
  );
}
