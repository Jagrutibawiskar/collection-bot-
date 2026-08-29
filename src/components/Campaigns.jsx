import { useMemo, useState } from "react";
import { campaigns, money } from "../data.js";
import { saveCampaignRules, simulateCampaign } from "../api.js";
import { Topbar, Kpi, JourneyStrip, Panel } from "./ui.jsx";

const initialRules = [
  { id: "d7", stage: "D-7", days: "7 days before due", label: "WhatsApp reminder", template: "wa_payment_link_v2", channels: { sms: false, whatsapp: true, aiVoice: false, agent: false }, window: "08:00 - 19:00" },
  { id: "d4", stage: "D-4", days: "4 days before due", label: "WhatsApp follow-up", template: "wa_followup_v1", channels: { sms: false, whatsapp: true, aiVoice: false, agent: false }, window: "08:00 - 19:00" },
  { id: "d1", stage: "D-1", days: "1 day before due", label: "Fund readiness call", template: "voice_funds_ready", channels: { sms: true, whatsapp: true, aiVoice: true, agent: false }, window: "09:00 - 18:30" },
  { id: "d0", stage: "D-Day", days: "Due date", label: "Deadline call", template: "voice_due_today", channels: { sms: true, whatsapp: true, aiVoice: true, agent: false }, window: "09:00 - 18:30" },
  { id: "handoff", stage: "After due", days: "Payment not received", label: "Manager handoff", template: "queue_overdue", channels: { sms: false, whatsapp: false, aiVoice: false, agent: true }, window: "Agent hours" }
];

const channelLabels = [["sms", "SMS"], ["whatsapp", "WhatsApp"], ["aiVoice", "AI voice"], ["agent", "Manager"]];

export default function Campaigns() {
  const [rules, setRules] = useState(initialRules);
  const [saved, setSaved] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [guardrails, setGuardrails] = useState({ maxPerDay: 3, quietStart: "19:00", quietEnd: "08:00", sundays: true, holidays: true, stopPayment: true, stopDispute: true, stopOptOut: true });

  const enabledCount = useMemo(() => rules.reduce((total, rule) => total + Object.values(rule.channels).filter(Boolean).length, 0), [rules]);

  function updateRule(id, patch) {
    setSaved(false);
    setRules(prev => prev.map(rule => rule.id === id ? { ...rule, ...patch } : rule));
  }

  function toggleChannel(id, channel) {
    setSaved(false);
    setRules(prev => prev.map(rule => rule.id === id ? { ...rule, channels: { ...rule.channels, [channel]: !rule.channels[channel] } } : rule));
  }

  function addStep() {
    setSaved(false);
    setRules(prev => [...prev, { id: `custom-${Date.now()}`, stage: "Custom", days: "Set day offset", label: "New step", template: "select_template", channels: { sms: true, whatsapp: false, aiVoice: false, agent: false }, window: "09:00 - 18:00" }]);
  }

  function runSimulation() {
    simulateCampaign({ rules, guardrails }).then(setSimulation);
  }

  function saveRules() {
    saveCampaignRules({ rules, guardrails }).then(() => setSaved(true));
  }

  return (
    <>
      <Topbar title="Campaigns" subtitle="Editable day-offset ladder with guardrails, simulation and payment/dispute stop rules." />
      <Panel title="Active automation flow" meta="D means due date"><JourneyStrip activeIndex={2} /></Panel>

      <section className="grid three" style={{ marginTop: 16 }}>
        <Kpi label="Campaign files" value={campaigns.length.toString()} note="from imports" />
        <Kpi label="Channels enabled" value={enabledCount.toString()} note="WA, SMS, AI voice, manager" />
        <Kpi label="Max contacts/day" value={String(guardrails.maxPerDay)} note="compliance cap" />
      </section>

      <Panel title="Campaign monitor" meta="phase-wise customer counts" style={{ marginTop: 16 }}>
        <div className="campaign-monitor">{campaigns.map(campaign => <div key={campaign.name} className="campaign-card"><div><span className="eyebrow">{campaign.file}</span><h3>{campaign.name}</h3><p>{campaign.customers.toLocaleString()} customers · {money(campaign.value)} portfolio</p></div><div className="phase-grid"><span><b>{campaign.whatsapp.toLocaleString()}</b>WhatsApp</span><span><b>{campaign.voice.toLocaleString()}</b>AI voice</span><span><b>{campaign.human.toLocaleString()}</b>Manager</span><span><b>{campaign.paid.toLocaleString()}</b>Paid</span></div></div>)}</div>
      </Panel>

      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Guardrails" meta="required before save">
          <div className="guardrail-grid">
            <label><span>Max contacts per day</span><input className="control" type="number" min="1" max="6" value={guardrails.maxPerDay} onChange={event => setGuardrails(prev => ({ ...prev, maxPerDay: Number(event.target.value) }))} /></label>
            <label><span>Quiet starts</span><input className="control" type="time" value={guardrails.quietStart} onChange={event => setGuardrails(prev => ({ ...prev, quietStart: event.target.value }))} /></label>
            <label><span>Quiet ends</span><input className="control" type="time" value={guardrails.quietEnd} onChange={event => setGuardrails(prev => ({ ...prev, quietEnd: event.target.value }))} /></label>
          </div>
          <div className="guardrail-checks">
            {[["sundays", "No Sundays"], ["holidays", "No bank holidays"], ["stopPayment", "Stop on payment"], ["stopDispute", "Stop on dispute"], ["stopOptOut", "Stop on opt-out"]].map(([key, label]) => <label key={key}><input type="checkbox" checked={guardrails[key]} onChange={event => setGuardrails(prev => ({ ...prev, [key]: event.target.checked }))} />{label}</label>)}
          </div>
        </Panel>

        <Panel title="Simulate before save" meta="dry run">
          {simulation ? <div className="simulation-grid"><span><b>{simulation.sms}</b>SMS</span><span><b>{simulation.whatsapp}</b>WhatsApp</span><span><b>{simulation.voice}</b>Voice</span><span><b>{simulation.bot_calls}</b>Bot calls</span><span><b>{money(simulation.estimated_cost)}</b>Estimated cost</span><span><b>14</b>Daily cap hits</span></div> : <div className="empty-soft">Run simulation to see sends, cost and cap hits before saving.</div>}
          <div className="dashboard-actions" style={{ marginTop: 14 }}><button type="button" className="primary" onClick={runSimulation}>Run simulation</button><button type="button" className="ghost" onClick={saveRules}>Save campaign</button></div>
        </Panel>
      </section>

      <Panel title="Rule editor" meta={saved ? "saved" : "draft"} action={<button type="button" className="primary" onClick={addStep}>Add step</button>} style={{ marginTop: 16 }}>
        <div className="campaign-rule-list">{rules.map(rule => <div key={rule.id} className="campaign-rule"><div className="campaign-rule-head"><div><input className="control rule-title-input" value={rule.stage} onChange={event => updateRule(rule.id, { stage: event.target.value })} aria-label="Stage" /><input className="control rule-label-input" value={rule.label} onChange={event => updateRule(rule.id, { label: event.target.value })} aria-label="Label" /><p>{rule.id === "handoff" ? "After due date, unpaid customers move to human calling queue." : "Payment link included where applicable; any payment stops future sends."}</p></div><div className="rule-side"><input className="control" value={rule.days} onChange={event => updateRule(rule.id, { days: event.target.value })} aria-label="Days" /><input className="control" value={rule.window} onChange={event => updateRule(rule.id, { window: event.target.value })} aria-label="Contact window" /><input className="control" value={rule.template} onChange={event => updateRule(rule.id, { template: event.target.value })} aria-label="Template" /></div></div><div className="channel-toggle-row">{channelLabels.map(([key, label]) => <button key={key} type="button" className={`channel-toggle ${rule.channels[key] ? "active" : ""}`} onClick={() => toggleChannel(rule.id, key)}>{label}</button>)}</div></div>)}</div>
      </Panel>
    </>
  );
}
