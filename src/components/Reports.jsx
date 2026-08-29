import { useMemo, useState } from "react";
import { getReports } from "../api.js";
import { Topbar, Kpi, Panel } from "./ui.jsx";

const reportTemplates = [
  { id: "summary", name: "Collections summary", format: "PDF", owner: "Operations", status: "Ready", size: "820 kB", metric: "By client and period" },
  { id: "channel", name: "Channel performance", format: "XLSX", owner: "AI Ops", status: "Ready", size: "1.2 MB", metric: "Sends, delivery, response, cost" },
  { id: "ptp", name: "Promise-to-pay register", format: "CSV", owner: "Collections", status: "Ready", size: "428 kB", metric: "Captured, kept, broken" },
  { id: "agent", name: "Agent productivity", format: "PDF", owner: "Recovery", status: "Ready", size: "680 kB", metric: "Calls, handle time, recovery" },
  { id: "recon", name: "Reconciliation", format: "XLSX", owner: "Finance", status: "Ready", size: "1.8 MB", metric: "Payments against accounts" }
];

export default function Reports() {
  const [range, setRange] = useState("Last 30 days");
  const [format, setFormat] = useState("All");
  const [client, setClient] = useState("All clients");
  const [selected, setSelected] = useState("summary");
  const [generated, setGenerated] = useState(null);
  const [schedule, setSchedule] = useState("Weekly Monday 9:00 AM");

  const visibleReports = useMemo(() => format === "All" ? reportTemplates : reportTemplates.filter(report => report.format === format), [format]);
  const activeReport = reportTemplates.find(report => report.id === selected) || reportTemplates[0];

  function generateReport() {
    getReports({ type: selected, range, client, format }).then(() => setGenerated(`${activeReport.name} queued for ${client}, ${range}. Large exports notify when ready.`));
  }

  return (
    <>
      <Topbar title="Reports" subtitle="Five canned reports, export queue and scheduled delivery." />
      <section className="grid three"><Kpi label="Queued exports" value="4" note="2 finishing today" /><Kpi label="Scheduled reports" value="7" note="weekly PDFs" /><Kpi label="Last export" value="12 min" note="audit logged" /></section>

      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Report builder" meta="GET /api/reports/:type">
          <div className="report-picker">{reportTemplates.map(report => <button key={report.id} type="button" className={selected === report.id ? "active" : ""} onClick={() => setSelected(report.id)}><strong>{report.name}</strong><span>{report.metric}</span></button>)}</div>
          <div className="report-builder three-inputs" style={{ marginTop: 14 }}><label><span>Client</span><select className="control" value={client} onChange={e => setClient(e.target.value)}><option>All clients</option><option>L&T Finance</option><option>Mahindra Finance</option><option>TVS Credit</option></select></label><label><span>Date range</span><select className="control" value={range} onChange={e => setRange(e.target.value)}><option>Today</option><option>Last 7 days</option><option>Last 30 days</option><option>This month</option></select></label><label><span>Format</span><select className="control" value={format} onChange={e => setFormat(e.target.value)}><option>All</option><option>CSV</option><option>XLSX</option><option>PDF</option></select></label><button type="button" className="primary" onClick={generateReport}>Queue export</button></div>
          {generated && <div className="auth-alert ok report-notice">{generated}</div>}
        </Panel>

        <Panel title="Scheduled delivery" meta="weekly reports"><div className="schedule-card"><label><span>Schedule</span><input className="control" value={schedule} onChange={e => setSchedule(e.target.value)} /></label><label><span>Recipients</span><input className="control" defaultValue="finance@client.com, ops@cegura.io" /></label><button className="ghost" type="button" onClick={() => setGenerated(`Schedule saved: ${schedule}.`)}>Save schedule</button></div></Panel>
      </section>

      <Panel title="Available exports" action={<button type="button" className="primary" onClick={generateReport}>Download selected</button>} style={{ marginTop: 16 }}><div className="report-card-grid">{visibleReports.map(report => <button type="button" key={report.id} className={`report-card ${selected === report.id ? "active" : ""}`} onClick={() => setSelected(report.id)}><span className={`report-format ${report.format.toLowerCase()}`}>{report.format}</span><h3>{report.name}</h3><p>{report.metric}</p><div><span className={`pill ${report.status === "Ready" ? "paid" : "open"}`}>{report.status}</span><span className="muted">{report.size}</span></div></button>)}</div></Panel>

      <Panel title="Export queue" meta="latest generated exports" style={{ marginTop: 16 }}><div className="table-wrap"><table><thead><tr><th>Report</th><th>Owner</th><th>Client</th><th>Format</th><th>Status</th><th>Size</th></tr></thead><tbody>{visibleReports.map(report => <tr key={report.id}><td><strong>{report.name}</strong><div className="muted">{range}</div></td><td>{report.owner}</td><td>{client}</td><td>{report.format}</td><td><span className="pill paid">Ready</span></td><td>{report.size}</td></tr>)}</tbody></table></div></Panel>
    </>
  );
}
