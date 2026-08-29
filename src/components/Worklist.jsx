import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorklist, patchAccount } from "../api.js";
import { dayOffsetLabel, lifecycleLabels, money, zoneClass } from "../data.js";
import { Kpi, Panel, Topbar } from "./ui.jsx";

const skipReasons = ["Callback later", "No answer", "Needs supervisor", "Customer busy", "Bad number"];

export default function Worklist() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [skipReason, setSkipReason] = useState(skipReasons[0]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getWorklist().then(result => setAccounts(result.data || []));
  }, []);

  const active = accounts[activeIndex] || null;
  const doneToday = accounts.filter(a => a.lifecycle === "paid").length;
  const brokenPromises = accounts.filter(a => a.lifecycle === "ptp" && a.offset > 0).length;
  const recovered = accounts.reduce((sum, a) => sum + (a.lifecycle === "paid" ? a.emiAmount || 0 : 0), 0);

  function updateActive(patch, message) {
    if (!active) return;
    patchAccount(active.id, patch);
    setAccounts(prev => prev.map(a => a.id === active.id ? { ...a, ...patch } : a));
    setToast(message);
  }

  function nextAccount() {
    setActiveIndex(prev => Math.min(accounts.length - 1, prev + 1));
  }

  function callNow() {
    updateActive({ channel: "agent", agent: active.agent === "Unassigned" ? "A. Khan" : active.agent }, `Call started for ${active.name}.`);
  }

  function markPaid() {
    updateActive({ lifecycle: "paid", remainingBalance: 0, pendingEmis: 0, agent: "Closed", channel: "payment" }, `${active.name} marked paid. Automation stopped.`);
    window.setTimeout(nextAccount, 400);
  }

  function skip() {
    updateActive({ lastSkipReason: skipReason }, `${active.name} skipped: ${skipReason}.`);
    nextAccount();
  }

  const queue = useMemo(() => accounts.filter((_, i) => i !== activeIndex).slice(0, 6), [accounts, activeIndex]);

  return (
    <>
      <Topbar title="Agent Worklist" subtitle="Server-ordered manager queue with one clear next account to work." />
      {toast && <div className="auth-alert ok queue-toast">{toast}</div>}
      <section className="grid three">
        <Kpi label="Queue" value={accounts.length.toString()} note="server ordered" />
        <Kpi label="Done today" value={doneToday.toString()} note="closed by agents" />
        <Kpi label="Recovered" value={money(recovered)} note={`${brokenPromises} broken PTP`} />
      </section>

      <section className="grid worklist-grid" style={{ marginTop: 16 }}>
        <Panel title="Next up" meta={active ? `${activeIndex + 1} of ${accounts.length}` : "empty"} className="nextup-panel">
          {active ? <div className={`nextup-card queue-${zoneClass(active)}`}>
            <div className="nextup-head"><div><span className="eyebrow">{active.client}</span><h2>{active.name}</h2><p>{active.id} · {active.campaign}</p></div><strong>{money(active.remainingBalance ?? active.amount)}</strong></div>
            <div className="nextup-flags"><span className={`pill ${active.lifecycle}`}>{lifecycleLabels[active.lifecycle]}</span><span className="day-chip hot">{dayOffsetLabel(active.offset)}</span>{active.lifecycle === "disputed" && <span className="pill disputed">Dispute</span>}{active.ptpDate && <span className="pill ptp">PTP {active.ptpDate}</span>}</div>
            <div className="nextup-context"><span>Last contact: {active.channel}</span><span>Agent: {active.agent}</span><span>EMI: {money(active.emiAmount || 0)}</span></div>
            <div className="nextup-actions"><button className="primary" type="button" onClick={() => navigate(`/console/${active.id}`)}>Call now</button><select className="control" value={skipReason} onChange={e => setSkipReason(e.target.value)}>{skipReasons.map(reason => <option key={reason}>{reason}</option>)}</select><button className="ghost" type="button" onClick={skip}>Skip</button><button className="ghost" type="button" onClick={() => navigate(`/accounts/${active.id}`)}>Open file</button><button className="ghost" type="button" onClick={markPaid}>Mark paid</button></div>
          </div> : <div className="empty-soft">No accounts in the manager queue.</div>}
        </Panel>

        <Panel title="Queue preview" meta="upcoming">
          <div className="queue-stack">{queue.map(item => <button key={item.id} type="button" onClick={() => setActiveIndex(accounts.findIndex(a => a.id === item.id))}><span><strong>{item.name}</strong><small>{item.client} · {item.id}</small></span><b>{dayOffsetLabel(item.offset)}</b></button>)}</div>
        </Panel>
      </section>
    </>
  );
}

