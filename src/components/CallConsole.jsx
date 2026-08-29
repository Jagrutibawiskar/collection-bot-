import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { saveCallDisposition } from "../api.js";
import { money } from "../data.js";
import { Panel } from "./ui.jsx";

export default function CallConsole() {
  const { id } = useParams();
  const [connected, setConnected] = useState(true);
  const [disposition, setDisposition] = useState("Promise to pay");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  function saveAndNext() {
    saveCallDisposition(id, { disposition, note });
    setSaved(true);
    setConnected(false);
  }

  return (
    <div className="call-console">
      <header className="call-header"><div><span className={`call-dot ${connected ? "live" : ""}`} />{connected ? "Connected 02:14" : "Call ended"}</div><strong>Rahul Sharma</strong><span>+91 ... 0821</span><Link className="ghost route-link" to={`/accounts/${id}`}>Open file</Link></header>
      {saved && <div className="auth-alert ok">Disposition saved. Queue can move to the next customer.</div>}
      <section className="call-grid">
        <Panel title="Context" meta="read-only"><div className="finance-grid"><span><b>{money(125000)}</b>Outstanding</span><span><b>7d</b>Overdue</span><span><b>Dispute</b>Prior flag</span><span><b>WA read</b>Last touch</span></div><div className="auth-alert error" style={{ marginTop: 12 }}>Vulnerability/dispute flags must be reviewed before closing.</div></Panel>
        <Panel title="Script prompt" meta="guided call"><div className="script-box"><strong>Opening</strong><p>Hello Rahul, I am calling from Cegura on behalf of your finance provider about your pending EMI. I can help with payment link, promise-to-pay, dispute, or callback.</p><strong>Compliance</strong><p>Confirm identity before discussing account details. Record promise date clearly.</p></div></Panel>
        <Panel title="Disposition" meta="required"><div className="outcome-form"><label><span>Result</span><select className="control" value={disposition} onChange={e => setDisposition(e.target.value)}><option>Promise to pay</option><option>Paid on call</option><option>Dispute</option><option>Callback</option><option>Refused</option><option>No contact</option></select></label><label><span>PTP/callback date</span><input className="control" type="date" defaultValue="2026-08-30" /></label><button className="primary" type="button" onClick={saveAndNext}>Save & next</button></div><textarea className="control note-box" placeholder="Call notes..." value={note} onChange={e => setNote(e.target.value)} /></Panel>
      </section>
    </div>
  );
}
