import { useMemo, useState } from "react";
import { campaigns, money } from "../data.js";
import { saveCampaignRules, simulateCampaign } from "../api.js";
import { Topbar, Kpi, JourneyStrip, Panel } from "./ui.jsx";

const initialRules = [
  { id: "d7", stage: "D-7", days: "7 days before due", label: "WhatsApp payment link", template: "wa_payment_link_v2", approval: "Approved", channels: { sms: false, whatsapp: true, aiVoice: false, agent: false }, window: "08:00 - 19:00" },
  { id: "d5sms", stage: "D-5 to D-3", days: "5 to 3 days before due", label: "SMS reminder window", template: "sms_soft_reminder", approval: "Approved", channels: { sms: true, whatsapp: false, aiVoice: false, agent: false }, window: "09:00 - 18:00" },
  { id: "d4", stage: "D-4", days: "4 days before due", label: "WhatsApp follow-up", template: "wa_followup_v1", approval: "Approved", channels: { sms: false, whatsapp: true, aiVoice: false, agent: false }, window: "08:00 - 19:00" },
  { id: "d1", stage: "D-1", days: "1 day before due", label: "Fund readiness call", template: "voice_funds_ready", approval: "Voice reviewed", channels: { sms: true, whatsapp: true, aiVoice: true, agent: false }, window: "09:00 - 18:30" },
  { id: "d0", stage: "D-Day", days: "Due date", label: "Deadline call", template: "voice_due_today", approval: "Voice reviewed", channels: { sms: true, whatsapp: true, aiVoice: true, agent: false }, window: "09:00 - 18:30" },
  { id: "handoff", stage: "After due", days: "Payment not received", label: "Manager handoff queue", template: "queue_overdue", approval: "Internal", channels: { sms: false, whatsapp: false, aiVoice: false, agent: true }, window: "Agent hours" }
];

const channelLabels = [["sms", "SMS"], ["whatsapp", "WhatsApp"], ["aiVoice", "AI voice"], ["agent", "Manager"]];

const templateCopy = {
  wa_payment_link_v2: "Hi {{customer}}, your EMI of {{amount}} is due on {{due_date}}. Pay securely here: {{payment_link}}.",
  sms_soft_reminder: "Reminder: EMI {{amount}} is due on {{due_date}}. Pay at {{payment_link}} to avoid follow-up calls.",
  wa_followup_v1: "Quick reminder, {{customer}}. Your EMI due date is approaching. Tap to pay: {{payment_link}}.",
  voice_funds_ready: "AI voice script confirms funds readiness and asks for payment commitment before due date.",
  voice_due_today: "AI voice script informs customer that EMI is due today and captures PTP, dispute or paid response.",
  queue_overdue: "Move overdue unpaid accounts to manager worklist with latest touch history and risk color."
};

function cloneRule(rule) {
  return { ...rule, id: `custom-${Date.now()}`, stage: `${rule.stage} copy`, label: `${rule.label} copy` };
}

export default function Campaigns() {
  const [rules, setRules] = useState(initialRules);
  const [saved, setSaved] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(initialRules[0].template);
  const [templateText, setTemplateText] = useState(templateCopy[initialRules[0].template]);
  const [guardrails, setGuardrails] = useState({ maxPerDay: 3, quietStart: "19:00", quietEnd: "08:00", sundays: true, holidays: true, stopPayment: true, stopDispute: true, stopOptOut: true });

  const enabledCount = useMemo(() => rules.reduce((total, rule) => total + Object.values(rule.channels).filter(Boolean).length, 0), [rules]);
  const smsSegments = Math.max(1, Math.ceil(templateText.length / 160));
  const stopRules = Object.entries(guardrails).filter(([key, value]) => key.startsWith("stop") && value).length;

  function updateRule(id, patch) {
    setSaved(false);
    setRules(prev => prev.map(rule => rule.id === id ? { ...rule, ...patch } : rule));
  }

  function toggleChannel(id, channel) {
    setSaved(false);
    setRules(prev => prev.map(rule => rule.id === id ? { ...rule, channels: { ...rule.channels, [channel]: !rule.channels[channel] } } : rule));
  }

  function moveRule(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= rules.length) return;
    setSaved(false);
    setRules(prev => {
      const copy = [...prev];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  }

  function addStep() {
    setSaved(false);
    setRules(prev => [...prev, { id: `custom-${Date.now()}`, stage: "Custom", days: "Set day offset", label: "New recovery touch", template: "sms_soft_reminder", approval: "Draft", channels: { sms: true, whatsapp: false, aiVoice: false, agent: false }, window: "09:00 - 18:00" }]);
  }

  function duplicateStep(rule) {
    setSaved(false);
    setRules(prev => [...prev, cloneRule(rule)]);
  }

  function removeStep(id) {
    setSaved(false);
    setRules(prev => prev.filter(rule => rule.id !== id));
  }

  function chooseTemplate(template) {
    setSelectedTemplate(template);
    setTemplateText(templateCopy[template] || "");
  }

  function runSimulation() {
    simulateCampaign({ rules, guardrails }).then(setSimulation);
  }

  function saveRules() {
    saveCampaignRules({ rules, guardrails, templateText }).then(() => setSaved(true));
  }

  return (
    <div className="campaign-page">
      <Topbar title="Campaigns" subtitle="Production-ready collection journey with WhatsApp, SMS, AI voice, handoff rules and simulation." />

      <section className="campaign-hero-card">
        <div>
          <span className="eyebrow">Collection orchestration</span>
          <h2>Automate every pre-due touch, then hand over overdue accounts cleanly.</h2>
          <p>Payments, disputes, opt-outs and PTP responses stop the next touch automatically, so agents only see the cases that need human attention.</p>
          <div className="campaign-actions">
            <button type="button" className="primary" onClick={runSimulation}>Run simulation</button>
            <button type="button" className="ghost" onClick={saveRules}>{saved ? "Saved" : "Save campaign"}</button>
          </div>
        </div>
        <div className="campaign-hero-panel">
          <JourneyStrip activeIndex={2} />
          <div className="campaign-hero-stats">
            <span><b>{rules.length}</b> stages</span>
            <span><b>{enabledCount}</b> channels</span>
            <span><b>{stopRules}</b> stop rules</span>
          </div>
        </div>
      </section>

      <section className="grid four compact-kpis" style={{ marginTop: 16 }}>
        <Kpi label="Campaign files" value={campaigns.length.toString()} note="from imports" />
        <Kpi label="Contacts/day cap" value={String(guardrails.maxPerDay)} note="per customer" />
        <Kpi label="Quiet hours" value={`${guardrails.quietStart}`} note={`until ${guardrails.quietEnd}`} />
        <Kpi label="Template status" value="6" note="approved/reviewed" />
      </section>

      <section className="campaign-workspace">
        <Panel title="Rule ladder" meta={saved ? "saved" : "draft"} action={<button type="button" className="primary small-action" onClick={addStep}>Add step</button>}>
          <div className="campaign-ladder">
            {rules.map((rule, index) => (
              <article key={rule.id} className="campaign-row">
                <div className="rule-order">
                  <span className="rule-handle" aria-hidden="true">::</span>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                </div>
                <div className="rule-grid">
                  <input className="control compact-control stage-input" value={rule.stage} onChange={event => updateRule(rule.id, { stage: event.target.value })} aria-label="Stage" />
                  <input className="control compact-control" value={rule.label} onChange={event => updateRule(rule.id, { label: event.target.value })} aria-label="Label" />
                  <input className="control compact-control" value={rule.days} onChange={event => updateRule(rule.id, { days: event.target.value })} aria-label="Day offset" />
                  <input className="control compact-control" value={rule.window} onChange={event => updateRule(rule.id, { window: event.target.value })} aria-label="Contact window" />
                  <select className="control compact-control" value={rule.template} onChange={event => { updateRule(rule.id, { template: event.target.value }); chooseTemplate(event.target.value); }} aria-label="Template">
                    {Object.keys(templateCopy).map(template => <option key={template}>{template}</option>)}
                  </select>
                </div>
                <div className="channel-toggle-row production-channels">
                  {channelLabels.map(([key, label]) => <button key={key} type="button" className={`channel-toggle ${rule.channels[key] ? "active" : ""}`} onClick={() => toggleChannel(rule.id, key)}>{label}</button>)}
                </div>
                <div className="rule-footer">
                  <span className="template-status">{rule.approval}</span>
                  <span>{rule.id === "handoff" ? "Overdue moves to manager worklist" : "Payment, dispute or opt-out stops future touches"}</span>
                  <div className="rule-controls">
                    <button type="button" className="icon-lite" onClick={() => moveRule(index, -1)} disabled={index === 0} aria-label="Move up">Up</button>
                    <button type="button" className="icon-lite" onClick={() => moveRule(index, 1)} disabled={index === rules.length - 1} aria-label="Move down">Down</button>
                    <button type="button" className="icon-lite" onClick={() => duplicateStep(rule)}>Copy</button>
                    <button type="button" className="icon-lite danger" onClick={() => removeStep(rule.id)} disabled={rules.length <= 1}>Remove</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <aside className="campaign-side-stack">
          <Panel title="Guardrails" meta="required before save">
            <div className="guardrail-grid production-guardrails">
              <label><span>Max contacts/day</span><input className="control" type="number" min="1" max="6" value={guardrails.maxPerDay} onChange={event => setGuardrails(prev => ({ ...prev, maxPerDay: Number(event.target.value) }))} /></label>
              <label><span>Quiet starts</span><input className="control" type="time" value={guardrails.quietStart} onChange={event => setGuardrails(prev => ({ ...prev, quietStart: event.target.value }))} /></label>
              <label><span>Quiet ends</span><input className="control" type="time" value={guardrails.quietEnd} onChange={event => setGuardrails(prev => ({ ...prev, quietEnd: event.target.value }))} /></label>
            </div>
            <div className="guardrail-checks production-checks">
              {[["sundays", "No Sundays"], ["holidays", "No bank holidays"], ["stopPayment", "Stop on payment"], ["stopDispute", "Stop on dispute"], ["stopOptOut", "Stop on opt-out"]].map(([key, label]) => <label key={key}><input type="checkbox" checked={guardrails[key]} onChange={event => setGuardrails(prev => ({ ...prev, [key]: event.target.checked }))} />{label}</label>)}
            </div>
          </Panel>

          <Panel title="Template preview" meta={`${smsSegments} SMS segment${smsSegments > 1 ? "s" : ""}`}>
            <select className="control" value={selectedTemplate} onChange={event => chooseTemplate(event.target.value)}>
              {Object.keys(templateCopy).map(template => <option key={template}>{template}</option>)}
            </select>
            <textarea className="control template-textarea" value={templateText} onChange={event => setTemplateText(event.target.value)} aria-label="Template message" />
            <div className="template-preview-card">
              <span className="eyebrow">Preview</span>
              <p>{templateText}</p>
            </div>
          </Panel>

          <Panel title="Simulation" meta="dry run before save">
            {simulation ? <div className="simulation-grid campaign-sim"><span><b>{simulation.sms}</b>SMS</span><span><b>{simulation.whatsapp}</b>WhatsApp</span><span><b>{simulation.voice}</b>Voice</span><span><b>{simulation.bot_calls}</b>Bot calls</span><span><b>{money(simulation.estimated_cost)}</b>Cost</span><span><b>14</b>Cap hits</span></div> : <div className="empty-soft">Run simulation to see sends, cost and cap hits before saving.</div>}
          </Panel>
        </aside>
      </section>

      <Panel title="Campaign monitor" meta="phase-wise customer counts" style={{ marginTop: 16 }}>
        <div className="campaign-monitor production-monitor">{campaigns.map(campaign => <div key={campaign.name} className="campaign-card"><div><span className="eyebrow">{campaign.file}</span><h3>{campaign.name}</h3><p>{campaign.customers.toLocaleString()} customers - {money(campaign.value)} portfolio</p></div><div className="phase-grid"><span><b>{campaign.whatsapp.toLocaleString()}</b>WhatsApp</span><span><b>{campaign.voice.toLocaleString()}</b>AI voice</span><span><b>{campaign.human.toLocaleString()}</b>Manager</span><span><b>{campaign.paid.toLocaleString()}</b>Paid</span></div></div>)}</div>
      </Panel>
    </div>
  );
}
