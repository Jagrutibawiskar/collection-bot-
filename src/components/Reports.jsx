import { useMemo, useState } from "react";
import { getReports } from "../api.js";
import { Topbar, Kpi, Panel } from "./ui.jsx";

const reportTemplates = [
  { id: "summary", name: "Collections summary", format: "PDF", owner: "Operations", status: "Ready", size: "820 kB", metric: "Portfolio, paid, overdue and recovery" },
  { id: "channel", name: "Channel performance", format: "XLSX", owner: "AI Ops", status: "Ready", size: "1.2 MB", metric: "WhatsApp, SMS, voice, cost and response" },
  { id: "calling", name: "AI calling outcomes", format: "XLSX", owner: "AI Ops", status: "Ready", size: "960 kB", metric: "Connected, PTP, dispute, failed and retry" },
  { id: "ptp", name: "Promise-to-pay register", format: "CSV", owner: "Collections", status: "Ready", size: "428 kB", metric: "Captured, kept, broken and follow-up" },
  { id: "agent", name: "Agent productivity", format: "PDF", owner: "Recovery", status: "Ready", size: "680 kB", metric: "Calls, handle time, escalations and recovery" },
  { id: "recon", name: "Reconciliation", format: "XLSX", owner: "Finance", status: "Ready", size: "1.8 MB", metric: "Payments matched against active accounts" },
  { id: "audit", name: "Audit and compliance", format: "PDF", owner: "Compliance", status: "Ready", size: "744 kB", metric: "Consent, opt-outs, template and export trail" }
];

const channelRows = [
  { label: "WhatsApp delivered", count: 1684, rate: 71, tone: "blue" },
  { label: "SMS sent", count: 4210, rate: 98, tone: "teal" },
  { label: "AI voice connected", count: 631, rate: 38, tone: "amber" },
  { label: "Human handoff", count: 126, rate: 13, tone: "red" }
];

const aiOutcomes = [
  { label: "Promise to pay", value: 42, note: "18 due today" },
  { label: "Paid during call", value: 31, note: "workflow stopped" },
  { label: "Disputes raised", value: 18, note: "agent queue" },
  { label: "No answer", value: 214, note: "retry window" }
];

const queueRows = [
  { report: "AI calling outcomes", owner: "AI Ops", client: "All clients", format: "XLSX", status: "Ready", size: "960 kB", created: "12 min ago" },
  { report: "Collections summary", owner: "Operations", client: "Bajaj Finance", format: "PDF", status: "Queued", size: "Large", created: "18 min ago" },
  { report: "Payment reconciliation", owner: "Finance", client: "L&T Finance", format: "XLSX", status: "Ready", size: "1.8 MB", created: "31 min ago" },
  { report: "Audit and compliance", owner: "Compliance", client: "All clients", format: "PDF", status: "Ready", size: "744 kB", created: "1 hr ago" }
];

export default function Reports() {
  const [range, setRange] = useState("Last 30 days");
  const [format, setFormat] = useState("All");
  const [client, setClient] = useState("All clients");
  const [selected, setSelected] = useState("calling");
  const [delivery, setDelivery] = useState("Download + email");
  const [generated, setGenerated] = useState(null);
  const [schedule, setSchedule] = useState("Weekly Monday 9:00 AM");

  const visibleReports = useMemo(() => format === "All" ? reportTemplates : reportTemplates.filter(report => report.format === format), [format]);
  const activeReport = reportTemplates.find(report => report.id === selected) || reportTemplates[0];

  function generateReport() {
    getReports({ type: selected, range, client, format, delivery }).then(() => setGenerated(`${activeReport.name} queued for ${client}, ${range}. Delivery: ${delivery}.`));
  }

  return (
    <div className="reports-page">
      <Topbar title="Reports" subtitle="Export-ready collections, channel, AI calling, reconciliation and compliance reporting." />

      <section className="reports-hero-card">
        <div>
          <span className="eyebrow">Reporting center</span>
          <h2>Track recovery health from import to final handoff.</h2>
          <p>Use time range, client, format and delivery controls to queue audit-safe exports for finance, operations and recovery teams.</p>
          <div className="report-hero-actions">
            <button type="button" className="primary" onClick={generateReport}>Queue export</button>
            <button type="button" className="ghost" onClick={() => setGenerated(`Schedule saved: ${schedule}.`)}>Save schedule</button>
          </div>
        </div>
        <div className="report-snapshot-grid">
          <span><b>₹4.27 Cr</b>collected</span>
          <span><b>631</b>voice connected</span>
          <span><b>42</b>PTP captured</span>
          <span><b>126</b>agent recoveries</span>
        </div>
      </section>

      <section className="grid four compact-kpis" style={{ marginTop: 16 }}>
        <Kpi label="Queued exports" value="4" note="2 finishing today" />
        <Kpi label="Scheduled reports" value="7" note="weekly PDFs" />
        <Kpi label="Last export" value="12 min" note="audit logged" />
        <Kpi label="Available reports" value={String(reportTemplates.length)} note="PDF, XLSX, CSV" />
      </section>

      <section className="reports-workspace">
        <Panel title="Report builder" meta="GET /api/reports/:type">
          <div className="reports-builder-shell">
            <div className="report-picker production-report-picker">
              {reportTemplates.map(report => <button key={report.id} type="button" className={selected === report.id ? "active" : ""} onClick={() => setSelected(report.id)}><span className={`report-format ${report.format.toLowerCase()}`}>{report.format}</span><strong>{report.name}</strong><small>{report.metric}</small></button>)}
            </div>
            <div className="report-builder-card">
              <h3>{activeReport.name}</h3>
              <p>{activeReport.metric}</p>
              <div className="report-filter-grid">
                <label><span>Client</span><select className="control" value={client} onChange={e => setClient(e.target.value)}><option>All clients</option><option>Bajaj Finance</option><option>L&T Finance</option><option>Mahindra Finance</option><option>TVS Credit</option></select></label>
                <label><span>Date range</span><select className="control" value={range} onChange={e => setRange(e.target.value)}><option>Today</option><option>Last 7 days</option><option>Last 30 days</option><option>This month</option><option>Custom range</option></select></label>
                <label><span>Format</span><select className="control" value={format} onChange={e => setFormat(e.target.value)}><option>All</option><option>CSV</option><option>XLSX</option><option>PDF</option></select></label>
                <label><span>Delivery</span><select className="control" value={delivery} onChange={e => setDelivery(e.target.value)}><option>Download + email</option><option>Download only</option><option>Email finance team</option><option>Webhook export</option></select></label>
              </div>
              <div className="report-preview-box">
                <span className="eyebrow">Included sections</span>
                <ul>
                  <li>Portfolio summary, collected, overdue and active bucket</li>
                  <li>WhatsApp, SMS, AI voice and human handoff funnel</li>
                  <li>PTP, dispute, paid, opt-out and stop-rule audit trail</li>
                </ul>
              </div>
              {generated && <div className="auth-alert ok report-notice">{generated}</div>}
            </div>
          </div>
        </Panel>

        <aside className="reports-side-stack">
          <Panel title="Scheduled delivery" meta="weekly reports">
            <div className="schedule-card production-schedule"><label><span>Schedule</span><input className="control" value={schedule} onChange={e => setSchedule(e.target.value)} /></label><label><span>Recipients</span><input className="control" defaultValue="finance@client.com, ops@cegura.io" /></label><button className="ghost" type="button" onClick={() => setGenerated(`Schedule saved: ${schedule}.`)}>Save schedule</button></div>
          </Panel>

          <Panel title="AI calling outcomes" meta="selected range">
            <div className="ai-outcome-grid">{aiOutcomes.map(item => <span key={item.label}><b>{item.value}</b>{item.label}<small>{item.note}</small></span>)}</div>
          </Panel>
        </aside>
      </section>

      <section className="reports-insight-grid">
        <Panel title="Channel funnel" meta="phase-wise movement">
          <div className="report-channel-list">{channelRows.map(row => <div key={row.label} className="report-channel-row"><div><strong>{row.label}</strong><span>{row.count.toLocaleString()} customers</span></div><div className="report-bar"><i className={row.tone} style={{ width: `${row.rate}%` }} /></div><b>{row.rate}%</b></div>)}</div>
        </Panel>

        <Panel title="Available exports" meta={`${visibleReports.length} visible`} action={<button type="button" className="primary small-action" onClick={generateReport}>Download selected</button>}>
          <div className="report-card-grid production-report-cards">{visibleReports.map(report => <button type="button" key={report.id} className={`report-card ${selected === report.id ? "active" : ""}`} onClick={() => setSelected(report.id)}><span className={`report-format ${report.format.toLowerCase()}`}>{report.format}</span><h3>{report.name}</h3><p>{report.metric}</p><div><span className={`pill ${report.status === "Ready" ? "paid" : "open"}`}>{report.status}</span><span className="muted">{report.size}</span></div></button>)}</div>
        </Panel>
      </section>

      <Panel title="Export queue" meta="latest generated exports" style={{ marginTop: 16 }}>
        <div className="table-wrap reports-table"><table><thead><tr><th>Report</th><th>Owner</th><th>Client</th><th>Format</th><th>Status</th><th>Size</th><th>Created</th></tr></thead><tbody>{queueRows.map(row => <tr key={`${row.report}-${row.client}`}><td><strong>{row.report}</strong><div className="muted">{range}</div></td><td>{row.owner}</td><td>{row.client}</td><td>{row.format}</td><td><span className={`pill ${row.status === "Ready" ? "paid" : "open"}`}>{row.status}</span></td><td>{row.size}</td><td>{row.created}</td></tr>)}</tbody></table></div>
      </Panel>
    </div>
  );
}
