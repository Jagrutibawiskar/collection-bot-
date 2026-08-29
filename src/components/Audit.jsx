import { useEffect, useMemo, useState } from "react";
import { getAudit } from "../api.js";
import { Topbar, Panel } from "./ui.jsx";

export default function Audit() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("all");
  const [action, setAction] = useState("all");
  const [notice, setNotice] = useState("");

  useEffect(() => { getAudit().then(result => setRows(result.data || [])); }, []);

  const actors = useMemo(() => [...new Set(rows.map(row => row.actor))], [rows]);
  const actions = useMemo(() => [...new Set(rows.map(row => row.action))], [rows]);
  const visible = rows.filter(row => {
    const matchText = !query || [row.actor, row.action, row.account, row.detail].some(value => value.toLowerCase().includes(query.toLowerCase()));
    return matchText && (actor === "all" || row.actor === actor) && (action === "all" || row.action === action);
  });

  function exportAudit() {
    setNotice("Audit export queued. This export action is also audited.");
  }

  return (
    <>
      <Topbar title="Audit Trail" subtitle="Append-only searchable record of payments, calls, exports and account changes." />
      {notice && <div className="auth-alert ok queue-toast">{notice}</div>}
      <Panel title="Search audit events" meta="GET /api/audit"><div className="report-builder three-inputs"><label><span>Search</span><input className="control" value={query} onChange={e => setQuery(e.target.value)} placeholder="Actor, account, action" /></label><label><span>Actor</span><select className="control" value={actor} onChange={e => setActor(e.target.value)}><option value="all">All actors</option>{actors.map(item => <option key={item}>{item}</option>)}</select></label><label><span>Action</span><select className="control" value={action} onChange={e => setAction(e.target.value)}><option value="all">All actions</option>{actions.map(item => <option key={item}>{item}</option>)}</select></label><button className="primary" type="button" onClick={exportAudit}>Export</button></div></Panel>
      <Panel title="Events" meta={`${visible.length} visible`} style={{ marginTop: 16 }}><div className="table-wrap"><table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Account</th><th>Detail</th></tr></thead><tbody>{visible.map(row => <tr key={row.id}><td>{row.at}</td><td>{row.actor}</td><td><span className="pill open">{row.action}</span></td><td>{row.account}</td><td>{row.detail}</td></tr>)}</tbody></table></div></Panel>
    </>
  );
}
