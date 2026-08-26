import { useMemo, useState } from "react";
import { Topbar, Kpi, JourneyStrip, Panel } from "./ui.jsx";

const initialRules = [
  { id: "stage-1", stage: "Stage 1", days: "D-5 to D-3", label: "Reminder", reach: "100%", cost: "Very low", channels: { sms: true, whatsapp: false, voice: false, aiVoice: false, agent: false }, window: "09:00 - 18:00" },
  { id: "stage-2", stage: "Stage 2", days: "D-2 to D0", label: "Pre-due", reach: "40%", cost: "Low", channels: { sms: false, whatsapp: true, voice: true, aiVoice: false, agent: false }, window: "09:30 - 17:30" },
  { id: "stage-3", stage: "Stage 3", days: "D+1 to D+3", label: "Overdue", reach: "15%", cost: "Medium", channels: { sms: false, whatsapp: true, voice: false, aiVoice: true, agent: false }, window: "09:30 - 19:30" },
  { id: "stage-4", stage: "Stage 4", days: "D+4 onward", label: "Escalated", reach: "5%", cost: "High", channels: { sms: false, whatsapp: false, voice: false, aiVoice: false, agent: true }, window: "Agent hours" }
];

const channelLabels = [
  ["sms", "SMS"],
  ["whatsapp", "WhatsApp"],
  ["voice", "Voice"],
  ["aiVoice", "AI voice"],
  ["agent", "Agent"]
];

export default function Campaigns() {
  const [rules, setRules] = useState(initialRules);
  const [saved, setSaved] = useState(false);

  const enabledCount = useMemo(() => {
    return rules.reduce((total, rule) => total + Object.values(rule.channels).filter(Boolean).length, 0);
  }, [rules]);

  function updateRule(id, patch) {
    setSaved(false);
    setRules(prev => prev.map(rule => rule.id === id ? { ...rule, ...patch } : rule));
  }

  function toggleChannel(id, channel) {
    setSaved(false);
    setRules(prev => prev.map(rule => {
      if (rule.id !== id) return rule;
      return {
        ...rule,
        channels: { ...rule.channels, [channel]: !rule.channels[channel] }
      };
    }));
  }

  return (
    <>
      <Topbar title="Campaign Rules" subtitle="Day-offset rules across SMS, voice, WhatsApp, AI bot and agent handoff." />
      <Panel title="Active journey" meta="server owns day_offset">
        <JourneyStrip activeIndex={8} />
      </Panel>

      <section className="grid three" style={{ marginTop: 16 }}>
        <Kpi label="Rules active" value={rules.length.toString()} note="stage based automation" />
        <Kpi label="Channels enabled" value={enabledCount.toString()} note="across campaign ladder" />
        <Kpi label="Compliance guard" value="On" note="payment kill-switch enforced" />
      </section>

      <Panel
        title="Rule editor"
        meta={saved ? "draft saved" : "unsaved draft"}
        action={<button type="button" className="primary" onClick={() => setSaved(true)}>Save rules</button>}
        style={{ marginTop: 16 }}
      >
        <div className="campaign-rule-list">
          {rules.map(rule => (
            <div key={rule.id} className="campaign-rule">
              <div className="campaign-rule-head">
                <div>
                  <span className="eyebrow">{rule.days}</span>
                  <h3>{rule.stage} · {rule.label}</h3>
                  <p>{rule.reach} reach · {rule.cost} cost</p>
                </div>
                <input
                  className="control"
                  value={rule.window}
                  onChange={event => updateRule(rule.id, { window: event.target.value })}
                  aria-label={`${rule.stage} contact window`}
                />
              </div>
              <div className="channel-toggle-row">
                {channelLabels.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`channel-toggle ${rule.channels[key] ? "active" : ""}`}
                    onClick={() => toggleChannel(rule.id, key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Compliance notes" meta="hard rules" style={{ marginTop: 16 }}>
        <div className="compliance-list">
          <div><strong>Payment success</strong><span>Stops all future sends immediately.</span></div>
          <div><strong>Vulnerability flag</strong><span>Suppresses voice and forces human review.</span></div>
          <div><strong>Day offset</strong><span>Rendered from backend value, never calculated in browser.</span></div>
        </div>
      </Panel>
    </>
  );
}
