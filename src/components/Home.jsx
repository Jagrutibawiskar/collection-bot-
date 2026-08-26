import { Topbar, JourneyStrip, Panel } from "./ui.jsx";

const features = [
  {
    icon: "\u21E7",
    eyebrow: "01 · Intake",
    title: "Get accounts in",
    body: "Upload CSV or XLSX ledgers, map messy columns, validate mobile numbers and preview how many customers will be contacted today.",
    cta: "Open import",
    view: "import"
  },
  {
    icon: "\u25A6",
    eyebrow: "02 · Monitor",
    title: "Watch the machine run",
    body: "Track outstanding balance, collected amount, channel delivery, stage funnel and payment success without losing tenant context.",
    cta: "Open dashboard",
    view: "dashboard"
  },
  {
    icon: "\u260E",
    eyebrow: "03 · Escalate",
    title: "Intervene by hand",
    body: "Send disputes, broken promises and escalated accounts into a focused agent worklist with clear lifecycle state.",
    cta: "Open worklist",
    view: "worklist"
  }
];

export default function Home({ onNavigate }) {
  return (
    <>
      <Topbar
        title="Cegura Collections Console"
        subtitle="AI-first collections platform for ledger upload, reminders, recovery and payment closure."
      />
      <section className="landing-hero">
        <div>
          <span className="eyebrow">Collections command centre</span>
          <h2>Recover faster, stop every reminder the moment payment lands.</h2>
          <p>Monitor overdue accounts, import ledgers, track WhatsApp and voice outcomes, and move expensive cases to agents with clean tenant scoping.</p>
          <div className="hero-metrics">
            <div><strong>80-95%</strong><span>resolved before agent</span></div>
            <div><strong>5 min</strong><span>payment reconciliation</span></div>
            <div><strong>3 roles</strong><span>ops, agent, client</span></div>
          </div>
          <div className="hero-actions">
            <button type="button" className="primary" onClick={() => onNavigate("import")}>Import ledger</button>
            <button type="button" className="ghost" onClick={() => onNavigate("accounts")}>View accounts</button>
          </div>
        </div>
        <div className="hero-status">
          <div><span>Machine state</span><strong>Running</strong></div>
          <div><span>Payment check</span><strong>Every 5 min</strong></div>
          <div><span>Kill-switch</span><strong>Active</strong></div>
        </div>
      </section>
      <section className="grid three">
        {features.map(f => (
          <div key={f.view} className="panel feature-panel">
            <div className="panel-body">
              <div className="feature-icon">{f.icon}</div>
              <span className="eyebrow">{f.eyebrow}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <button type="button" className="ghost" onClick={() => onNavigate(f.view)}>{f.cta}</button>
            </div>
          </div>
        ))}
      </section>
      <Panel title="Collection journey" meta="Phase 1 to Phase 2" style={{ marginTop: 16 }}>
        <JourneyStrip activeIndex={5} />
      </Panel>
    </>
  );
}
