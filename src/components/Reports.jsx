import { useMemo, useState } from "react";
import { Topbar, Kpi, Panel } from "./ui.jsx";

const reportTemplates = [
  { id: "collections", name: "Collections by lifecycle", format: "CSV", owner: "Ops", status: "Ready", size: "428 kB" },
  { id: "payments", name: "Payment reconciliation", format: "CSV", owner: "Finance", status: "Ready", size: "212 kB" },
  { id: "cost", name: "Cost per collection", format: "XLSX", owner: "Ops", status: "Ready", size: "1.4 MB" },
  { id: "audit", name: "Immutable audit trail", format: "CSV", owner: "Compliance", status: "Queued", size: "P2" },
  { id: "agent", name: "Agent outcomes", format: "PDF", owner: "Recovery", status: "Ready", size: "680 kB" }
];

export default function Reports() {
  const [range, setRange] = useState("Last 30 days");
  const [format, setFormat] = useState("All");
  const [generated, setGenerated] = useState(null);

  const visibleReports = useMemo(() => {
    if (format === "All") return reportTemplates;
    return reportTemplates.filter(report => report.format === format);
  }, [format]);

  function generateReport() {
    setGenerated(`Generated ${format === "All" ? "report pack" : format} export for ${range}.`);
  }

  return (
    <>
      <Topbar title="Reports" subtitle="Exports for collections, payments, cost and audit trail." />
      <section className="grid three">
        <Kpi label="Payments today" value="248" note="thank-you SMS queued" />
        <Kpi label="WhatsApp delivered" value="1,684" note="71% read rate" />
        <Kpi label="Voice connected" value="631" note="38% answered" />
      </section>

      <Panel title="Generate report" meta="mock export job" style={{ marginTop: 16 }}>
        <div className="report-builder">
          <label>
            <span>Date range</span>
            <select className="control" value={range} onChange={event => setRange(event.target.value)}>
              <option>Today</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
            </select>
          </label>
          <label>
            <span>Format</span>
            <select className="control" value={format} onChange={event => setFormat(event.target.value)}>
              <option>All</option>
              <option>CSV</option>
              <option>XLSX</option>
              <option>PDF</option>
            </select>
          </label>
          <button type="button" className="primary" onClick={generateReport}>Generate export</button>
        </div>
        {generated && <div className="auth-alert ok report-notice">{generated}</div>}
      </Panel>

      <Panel
        title="Available exports"
        action={<button type="button" className="primary">Download selected</button>}
        style={{ marginTop: 16 }}
      >
        <div className="report-card-grid">
          {visibleReports.map(report => (
            <div key={report.id} className="report-card">
              <span className={`report-format ${report.format.toLowerCase()}`}>{report.format}</span>
              <h3>{report.name}</h3>
              <p>{report.owner} · {range}</p>
              <div>
                <span className={`pill ${report.status === "Ready" ? "paid" : "open"}`}>{report.status}</span>
                <span className="muted">{report.size}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Report queue" meta="latest generated exports" style={{ marginTop: 16 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Report</th><th>Owner</th><th>Format</th><th>Status</th><th>Size</th></tr></thead>
            <tbody>
              {visibleReports.map(report => (
                <tr key={report.id}>
                  <td><strong>{report.name}</strong><div className="muted">{range}</div></td>
                  <td>{report.owner}</td>
                  <td>{report.format}</td>
                  <td><span className={`pill ${report.status === "Ready" ? "paid" : "open"}`}>{report.status}</span></td>
                  <td>{report.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
