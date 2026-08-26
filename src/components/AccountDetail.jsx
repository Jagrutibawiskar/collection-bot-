import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAccount } from "../api.js";
import { dayOffsetLabel, lifecycleLabels, money } from "../data.js";
import { JourneyStrip, Kpi, Panel, Topbar } from "./ui.jsx";

const timeline = [
  { time: "10:42", title: "Payment link opened", body: "Customer opened WhatsApp payment link.", channel: "WhatsApp" },
  { time: "09:54", title: "AI voice answered", body: "Intent captured: promise_to_pay. Follow-up queued.", channel: "AI Voice" },
  { time: "Yesterday", title: "Reminder delivered", body: "SMS delivered with payment reference and short link.", channel: "SMS" }
];

const agents = ["A. Khan", "M. Stone", "Priya Mehta", "Jordan Ellis"];

export default function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [events, setEvents] = useState(timeline);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAccount(id).then(data => {
      if (!active) return;
      setAccount(data);
      setEvents(timeline);
      setNotice("");
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  function addEvent(title, body, channel) {
    const event = { time: "Now", title, body, channel };
    setEvents(prev => [event, ...prev]);
    setNotice(body);
  }

  function sendPaymentLink() {
    addEvent("Payment link sent", "Secure payment link and QR code sent over WhatsApp.", "WhatsApp");
  }

  function togglePause() {
    setAccount(prev => ({ ...prev, paused: !prev.paused }));
    addEvent(
      account.paused ? "Campaign resumed" : "Campaign paused",
      account.paused ? "Automation can continue for this account." : "All automated sends are suspended for this account.",
      "Control"
    );
  }

  function assignAgent(agent) {
    setAccount(prev => ({ ...prev, agent }));
    addEvent("Agent assigned", `${agent} now owns this account.`, "Agent");
  }

  function saveNote() {
    if (!note.trim()) {
      setNotice("Add a note before saving.");
      return;
    }
    addEvent("Agent note saved", note.trim(), "Note");
    setNote("");
  }

  const activeIndex = useMemo(() => {
    if (!account) return 5;
    return Math.max(0, Math.min(9, account.offset + 5));
  }, [account]);

  const agentOptions = useMemo(() => {
    if (!account?.agent || agents.includes(account.agent)) return agents;
    return [account.agent, ...agents];
  }, [account]);

  if (loading) {
    return (
      <>
        <Topbar title="Loading account" subtitle="Fetching account detail and contact timeline." />
        <div className="panel skeleton-panel" />
      </>
    );
  }

  if (!account) {
    return (
      <>
        <Topbar title="Account not found" subtitle="The selected account is not available." />
        <Link className="ghost route-link" to="/accounts">Back to accounts</Link>
      </>
    );
  }

  return (
    <>
      <div className="detail-back-row">
        <Link className="ghost route-link" to="/accounts">← Back to accounts</Link>
      </div>
      <section className="account-hero panel">
        <div>
          <span className="eyebrow">Account 360</span>
          <h1>{account.name}</h1>
          <p>{account.client} · {account.id} · Due {account.due}</p>
          <div className="detail-actions">
            <button type="button" className="primary" onClick={sendPaymentLink}>Send payment link</button>
            <button type="button" className="ghost" onClick={togglePause}>{account.paused ? "Resume campaign" : "Pause campaign"}</button>
            <select className="control" value={account.agent} onChange={event => assignAgent(event.target.value)}>
              <option>Unassigned</option>
              {agentOptions.map(agent => <option key={agent}>{agent}</option>)}
            </select>
          </div>
          {notice && <div className="auth-alert ok detail-notice">{notice}</div>}
        </div>
        <div className="account-status-card">
          <span className={`pill ${account.lifecycle}`}>{lifecycleLabels[account.lifecycle]}</span>
          <strong>{money(account.amount)}</strong>
          <small>{dayOffsetLabel(account.offset)} · Stage {account.stage} · {account.paused ? "Paused" : "Active"}</small>
        </div>
      </section>

      <section className="grid three" style={{ marginTop: 16 }}>
        <Kpi label="Outstanding" value={money(account.amount)} note="gateway reference ready" />
        <Kpi label="Last touch" value={account.channel} note="latest channel" />
        <Kpi label="Assigned agent" value={account.agent} note="human owner" />
      </section>

      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Journey position" meta="server day_offset">
          <JourneyStrip activeIndex={activeIndex} />
        </Panel>
        <Panel title="Consent and controls" meta="compliance">
          <div className="consent-grid">
            {["SMS", "WhatsApp", "Voice"].map(item => <span key={item} className="pill paid">{item} allowed</span>)}
            <span className="pill open">No vulnerability flag</span>
          </div>
        </Panel>
      </section>

      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Communication timeline" meta="latest first" bodyClassName="panel-body timeline">
          {events.map((item, index) => (
            <div key={`${item.title}-${index}`} className="timeline-item">
              <span>{item.time}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
              <span className="pill">{item.channel}</span>
            </div>
          ))}
        </Panel>
        <Panel title="Agent note" meta="demo local state">
          <textarea
            className="control note-box"
            placeholder="Log dispute details, callback time, or settlement context..."
            value={note}
            onChange={event => setNote(event.target.value)}
          />
          <button type="button" className="primary" style={{ marginTop: 12 }} onClick={saveNote}>Save note</button>
        </Panel>
      </section>
    </>
  );
}
