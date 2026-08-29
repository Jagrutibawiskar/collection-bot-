import { useEffect, useMemo, useState } from "react";
import { getAudit } from "../api.js";
import { Topbar, Kpi, Panel } from "./ui.jsx";

const riskCards = [
  { label: "Export audits", value: "38", note: "all logged" },
  { label: "Consent checks", value: "99.2%", note: "valid contacts" },
  { label: "Policy stops", value: "74", note: "payment/dispute/opt-out" },
  { label: "Open reviews", value: "3", note: "needs approval" }
];

const complianceRows = [
  { label: "Payment stop rule", status: "Passing", detail: "Future touches stop after payment reconciliation." },
  { label: "Dispute handoff", status: "Passing", detail: "Disputed customers move to human review queue." },
  { label: "Quiet hours", status: "Passing", detail: "AI voice and SMS blocked outside configured window." },
  { label: "Template approval", status: "Review", detail: "Two WhatsApp templates waiting for final business sign-off." }
];

export default function Audit() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("all");
  const [action, setAction] = useState("all");
  const [range, setRange] = useState("Last 30 days");
  const [severity, setSeverity] = useState("all");
  const [notice, setNotice] = useState("");

  useEffect(() => { getAudit().then(result => setRows(result.data || [])); }, []);

  const actors = useMemo(() => [...new Set(rows.map(row => row.actor))], [rows]);
  const actions = useMemo(() => [...new Set(rows.map(row => row.action))], [rows]);
  const visible = rows.filter(row => {
    const values = [row.actor, row.action, row.account, row.detail].map(value => String(value || "").toLowerCase());
    const matchText = !query || values.some(value => value.includes(query.toLowerCase()));
    const severityMatch = severity === "all" || (severity === "review" ? row.action.toLowerCase().includes("export") : !row.action.toLowerCase().includes("export"));
    return matchText && severityMatch && (actor === "all" || row.actor === actor) && (action === "all" || row.action === action);
  });

  function exportAudit() {
    setNotice(`Audit export queued for ${range}. This export action is also recorded.`);
  }

  return (
    <div className="audit-page">
      <Topbar title="Audit Trail" subtitle="Append-only searchable record of payments, calls, exports, consent and account changes." />
      {notice && <div className="auth-alert ok queue-toast">{notice}</div>}

      <section className="audit-hero-card">
        <div>
          <span className="eyebrow">Compliance command</span>
          <h2>Every customer touch has a clear trail.</h2>
          <p>Track who changed what, which automation fired, why a customer stopped receiving messages and when an export was created.</p>
          <div className="audit-actions">
            <button className="primary" type="button" onClick={exportAudit}>Export audit</button>
            <button className="ghost" type="button" onClick={() => setNotice("Review queue opened for compliance team.")}>Open reviews</button>
          </div>
        </div>
        <div className="audit-status-list">
          {complianceRows.map(row => <div key={row.label} className="audit-status-item"><span className={`template-status ${row.status === "Review" ? "review" : ""}`}>{row.status}</span><strong>{row.label}</strong><p>{row.detail}</p></div>)}
        </div>
      </section>

      <section className="grid four compact-kpis" style={{ marginTop: 16 }}>
        {riskCards.map(card => <Kpi key={card.label} label={card.label} value={card.value} note={card.note} />)}
      </section>

      <Panel title="Search audit events" meta="GET /api/audit" style={{ marginTop: 16 }}>
        <div className="audit-filter-shell">
          <input className="control" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search actor, account, action" />
          <select className="control" value={actor} onChange={e => setActor(e.target.value)}><option value="all">All actors</option>{actors.map(item => <option key={item}>{item}</option>)}</select>
          <select className="control" value={action} onChange={e => setAction(e.target.value)}><option value="all">All actions</option>{actions.map(item => <option key={item}>{item}</option>)}</select>
          <select className="control" value={range} onChange={e => setRange(e.target.value)}><option>Today</option><option>Last 7 days</option><option>Last 30 days</option><option>This month</option></select>
          <select className="control" value={severity} onChange={e => setSeverity(e.target.value)}><option value="all">All severities</option><option value="review">Needs review</option><option value="normal">Normal</option></select>
          <button className="primary" type="button" onClick={exportAudit}>Export</button>
        </div>
      </Panel>

      <section className="audit-workspace">
        <Panel title="Events" meta={`${visible.length} visible`}>
          <div className="table-wrap audit-table"><table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Account</th><th>Detail</th></tr></thead><tbody>{visible.map(row => <tr key={row.id}><td>{row.at}</td><td><strong>{row.actor}</strong></td><td><span className="pill open">{row.action}</span></td><td>{row.account}</td><td>{row.detail}</td></tr>)}</tbody></table></div>
        </Panel>

        <Panel title="Review timeline" meta="latest policy events">
          <div className="audit-timeline">
            <div><span />Payment received - workflow stopped for 31 accounts</div>
            <div><span />D-Day AI voice campaign completed with 42 PTPs</div>
            <div><span />Two WhatsApp templates moved to approval review</div>
            <div><span />Manager handoff queue refreshed for overdue accounts</div>
          </div>
        </Panel>
      </section>
    </div>
  );
}
