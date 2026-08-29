import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAccount, getAccountTouches, patchAccount, saveCallDisposition } from "../api.js";
import { dayOffsetLabel, lifecycleLabels, money } from "../data.js";
import { JourneyStrip, Kpi, Panel, Topbar } from "./ui.jsx";

const fallbackTimeline = [
  { time: "10:42", title: "WhatsApp · read", body: "Customer opened payment link.", channel: "WhatsApp" },
  { time: "09:54", title: "AI voice · answered", body: "Intent captured: promise_to_pay.", channel: "AI Voice" },
  { time: "Yesterday", title: "SMS · delivered", body: "Reminder delivered with payment reference.", channel: "SMS" }
];

const agents = ["A. Khan", "M. Stone", "Priya Mehta", "Jordan Ellis"];
const outcomes = ["Payment collected", "Promise to pay", "Refusal", "Wrong number", "Dispute", "No answer"];
const pauseReasons = ["Customer requested pause", "Dispute under review", "Vulnerability flag", "Wrong number", "Manager review"];
const tabs = ["Communications", "Payments", "Agent notes", "Audit"];

function ConfirmModal({ account, onClose, onConfirm }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="paid-title">
      <div className="modal-card">
        <h2 id="paid-title">Mark account as paid?</h2>
        <p>This cancels scheduled WhatsApp, SMS, AI voice and manager follow-up for this EMI cycle. A payment success event will be added to the audit trail.</p>
        <div className="modal-summary"><span>Customer</span><strong>{account.name}</strong><span>Remaining</span><strong>{money(account.remainingBalance ?? account.amount)}</strong></div>
        <div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={onConfirm}>Confirm paid</button></div>
      </div>
    </div>
  );
}

export default function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [events, setEvents] = useState(fallbackTimeline);
  const [notice, setNotice] = useState("");
  const [outcome, setOutcome] = useState("Promise to pay");
  const [ptpDate, setPtpDate] = useState("2026-08-30");
  const [pauseReason, setPauseReason] = useState(pauseReasons[0]);
  const [activeTab, setActiveTab] = useState("Communications");
  const [showPaidConfirm, setShowPaidConfirm] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getAccount(id), getAccountTouches(id)]).then(([record, touches]) => {
      if (!active) return;
      setAccount(record);
      const mapped = (touches?.data || []).map(touch => ({
        time: new Date(touch.at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        title: `${touch.channel} · ${touch.status}`,
        body: touch.transcript || touch.body || touch.intent || "Contact event recorded.",
        channel: touch.channel
      }));
      setEvents(mapped.length ? mapped : fallbackTimeline);
      setNotice("");
      setPtpDate(record?.ptpDate || "2026-08-30");
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  function addEvent(title, body, channel) {
    setEvents(prev => [{ time: "Now", title, body, channel }, ...prev]);
    setNotice(body);
  }

  function applyPatch(patch) {
    setAccount(prev => ({ ...prev, ...patch }));
    patchAccount(account.id, patch);
  }

  function sendPaymentLink() {
    navigator.clipboard?.writeText(account.payment_link || `https://pay.cegura.com/${account.id}`);
    addEvent("Payment link copied", "Payment link copied and ready to share on WhatsApp.", "Payment");
  }

  function startCall() {
    const patch = { channel: "agent", agent: account.agent === "Unassigned" ? "A. Khan" : account.agent };
    applyPatch(patch);
    addEvent("Human call started", "Manager opened contextual dialer with AI call history and payment timeline.", "Agent");
  }

  function confirmPaid() {
    const patch = { lifecycle: "paid", remainingBalance: 0, pendingEmis: 0, channel: "payment", agent: "Closed", paused: true };
    applyPatch(patch);
    saveCallDisposition(account.id, { outcome: "Payment collected", patch });
    setShowPaidConfirm(false);
    addEvent("Payment collected", "Payment success received. All scheduled contacts are stopped for this EMI cycle.", "Payment");
  }

  function applyOutcome() {
    const map = {
      "Payment collected": { lifecycle: "paid", channel: "payment", agent: "Closed", paused: true, remainingBalance: 0, pendingEmis: 0 },
      "Promise to pay": { lifecycle: "ptp", channel: "agent", ptpDate, paused: true },
      "Refusal": { lifecycle: "escalated", channel: "agent" },
      "Wrong number": { lifecycle: "unreachable", channel: "agent", paused: true },
      "Dispute": { lifecycle: "disputed", channel: "agent", paused: true },
      "No answer": { lifecycle: "escalated", channel: "agent" }
    };
    const patch = map[outcome] || {};
    applyPatch(patch);
    saveCallDisposition(account.id, { outcome, ptpDate, patch });
    const detail = outcome === "Promise to pay" ? `Promise date logged for ${ptpDate}; follow-up paused until then.` : `${outcome} logged by manager.`;
    addEvent("Call outcome logged", detail, "Agent");
  }

  function togglePause() {
    const patch = { paused: !account.paused, pauseReason: !account.paused ? pauseReason : null };
    applyPatch(patch);
    addEvent(account.paused ? "Campaign resumed" : "Campaign paused", account.paused ? "Automation can continue for this account." : `Automation paused. Reason: ${pauseReason}.`, "Control");
  }

  function assignAgent(agent) {
    applyPatch({ agent });
    addEvent("Agent assigned", `${agent} now owns this account.`, "Agent");
  }

  function saveNote() {
    if (!note.trim()) { setNotice("Add a note before saving."); return; }
    addEvent("Agent note saved", note.trim(), "Note");
    setNote("");
  }

  const activeIndex = useMemo(() => {
    if (!account) return 0;
    if (account.lifecycle === "paid") return 4;
    if (account.offset > 0) return 5;
    if (account.offset === 0) return 3;
    if (account.offset >= -1) return 2;
    if (account.offset >= -4) return 1;
    return 0;
  }, [account]);

  const agentOptions = useMemo(() => !account?.agent || agents.includes(account.agent) ? agents : [account.agent, ...agents], [account]);
  const payments = [{ date: "2026-07-14", amount: account?.paidAmount || 0, reference: "RZP-8X2K", status: "Settled" }];
  const audit = [{ time: "Now", action: account?.paused ? "pause_enabled" : "record_loaded", detail: account?.pauseReason || "Account viewed" }, { time: "Yesterday", action: "touch_created", detail: "Reminder event persisted" }];

  if (loading) return <><Topbar title="Loading account" subtitle="Fetching account detail and contact timeline." /><div className="panel skeleton-panel" /></>;
  if (!account) return <><Topbar title="Account not found" subtitle="The selected account is not available." /><Link className="ghost route-link" to="/accounts">Back to accounts</Link></>;

  return (
    <>
      {showPaidConfirm && <ConfirmModal account={account} onClose={() => setShowPaidConfirm(false)} onConfirm={confirmPaid} />}
      <div className="detail-back-row"><Link className="ghost route-link" to="/accounts">← Back to accounts</Link></div>
      <section className="account-hero panel">
        <div>
          <span className="eyebrow">Account 360</span>
          <h1>{account.name}</h1>
          <p>{account.client} · {account.id} · {account.campaign} · Due {account.due}</p>
          <div className="detail-actions">
            <button type="button" className="primary" onClick={startCall}>Start call</button>
            <button type="button" className="ghost" onClick={sendPaymentLink}>Copy payment link</button>
            <button type="button" className="ghost" onClick={() => setShowPaidConfirm(true)}>Mark as paid</button>
            <select className="control" value={pauseReason} onChange={event => setPauseReason(event.target.value)}>{pauseReasons.map(reason => <option key={reason}>{reason}</option>)}</select>
            <button type="button" className="ghost" onClick={togglePause}>{account.paused ? "Resume" : "Pause"}</button>
            <select className="control" value={account.agent} onChange={event => assignAgent(event.target.value)}><option>Unassigned</option>{agentOptions.map(agent => <option key={agent}>{agent}</option>)}</select>
          </div>
          {notice && <div className="auth-alert ok detail-notice">{notice}</div>}
        </div>
        <div className="account-status-card"><span className={`pill ${account.lifecycle}`}>{lifecycleLabels[account.lifecycle]}</span><strong>{money(account.remainingBalance ?? account.amount)}</strong><small>{dayOffsetLabel(account.offset)} · Stage {account.stage} · {account.paused ? "Paused" : "Active"}</small></div>
      </section>

      <section className="grid three" style={{ marginTop: 16 }}><Kpi label="EMI amount" value={money(account.emiAmount || account.amount)} note={`${account.pendingEmis ?? "-"} EMI pending`} /><Kpi label="Remaining" value={money(account.remainingBalance ?? account.amount)} note={`paid ${money(account.paidAmount || 0)}`} /><Kpi label="Assigned agent" value={account.agent} note={account.ptpDate ? `PTP ${account.ptpDate}` : "human owner"} /></section>

      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Journey position" meta="server day_offset"><JourneyStrip activeIndex={activeIndex} /><div className="skip-list"><span>D-1 voice skipped only if consent is off.</span><span>Dispute or vulnerability flag routes directly to manager.</span></div></Panel>
        <Panel title="Finance breakup" meta="from uploaded sheet"><div className="finance-grid"><span><b>{account.totalEmis}</b>Total EMI</span><span><b>{account.pendingEmis}</b>Pending EMI</span><span><b>{money(account.insurance || 0)}</b>Insurance</span><span><b>{money(account.serviceTax || 0)}</b>Service tax</span><span><b>{money(account.fine || 0)}</b>Fine</span><span><b>{account.due}</b>Next due</span></div></Panel>
      </section>

      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Evidence file" meta="communications, payments, notes, audit">
          <div className="tabs">{tabs.map(tab => <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
          {activeTab === "Communications" && <div className="timeline tab-body">{events.map((item, index) => <div key={`${item.title}-${index}`} className="timeline-item"><span>{item.time}</span><div><strong>{item.title}</strong><p>{item.body}</p></div><span className="pill">{item.channel}</span></div>)}</div>}
          {activeTab === "Payments" && <div className="table-wrap tab-body"><table><thead><tr><th>Date</th><th>Amount</th><th>Reference</th><th>Status</th></tr></thead><tbody>{payments.map(row => <tr key={row.reference}><td>{row.date}</td><td>{money(row.amount)}</td><td>{row.reference}</td><td><span className="pill paid">{row.status}</span></td></tr>)}</tbody></table></div>}
          {activeTab === "Agent notes" && <div className="tab-body"><textarea className="control note-box" placeholder="Log dispute details, callback time, refusal reason, or settlement context..." value={note} onChange={event => setNote(event.target.value)} /><button type="button" className="ghost" style={{ marginTop: 12 }} onClick={saveNote}>Save note</button></div>}
          {activeTab === "Audit" && <div className="timeline tab-body">{audit.map((item, index) => <div key={index} className="timeline-item"><span>{item.time}</span><div><strong>{item.action}</strong><p>{item.detail}</p></div><span className="pill">Audit</span></div>)}</div>}
        </Panel>
        <Panel title="Human call outcome" meta="manager logging"><div className="outcome-form"><label><span>Outcome</span><select className="control" value={outcome} onChange={event => setOutcome(event.target.value)}>{outcomes.map(item => <option key={item}>{item}</option>)}</select></label><label><span>PTP date</span><input className="control" type="date" value={ptpDate} onChange={event => setPtpDate(event.target.value)} /></label><button type="button" className="primary" onClick={applyOutcome}>Save outcome</button></div></Panel>
      </section>
    </>
  );
}
