import { JourneyStrip } from "./ui.jsx";

const features = [
  {
    icon: "\u21E7",
    eyebrow: "01 · Intake",
    title: "Get accounts in",
    body: "Upload CSV or XLSX ledgers, map messy columns, validate mobile numbers and preview how many customers will be contacted today."
  },
  {
    icon: "\u25A6",
    eyebrow: "02 · Monitor",
    title: "Watch the machine run",
    body: "Track outstanding balance, collected amount, channel delivery, stage funnel and payment success without losing tenant context."
  },
  {
    icon: "\u260E",
    eyebrow: "03 · Escalate",
    title: "Intervene by hand",
    body: "Send disputes, broken promises and escalated accounts into a focused agent worklist with clear lifecycle state."
  }
];

export default function Landing({ onNavigate }) {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="auth-brand">
          <div className="brand-mark">C</div>
          <span>Cegura</span>
        </div>
        <nav className="landing-links">
          <a href="#product">Product</a>
          <a href="#journey">Journey</a>
          <a href="#numbers">Results</a>
        </nav>
        <div className="landing-nav-actions">
          <button type="button" className="ghost" onClick={() => onNavigate("login")}>Sign in</button>
          <button type="button" className="primary" onClick={() => onNavigate("signup")}>Get started</button>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero public">
          <div>
            <span className="eyebrow">Collections command centre</span>
            <h1>Recover faster, stop every reminder the moment payment lands.</h1>
            <p>Monitor overdue accounts, import ledgers, track WhatsApp and voice outcomes, and move expensive cases to agents with clean tenant scoping.</p>
            <div className="hero-actions">
              <button type="button" className="primary" onClick={() => onNavigate("signup")}>Create free account</button>
              <button type="button" className="ghost" onClick={() => onNavigate("login")}>Sign in to console</button>
            </div>
            <div className="hero-metrics" id="numbers">
              <div><strong>80-95%</strong><span>resolved before agent</span></div>
              <div><strong>5 min</strong><span>payment reconciliation</span></div>
              <div><strong>3 roles</strong><span>ops, agent, client</span></div>
            </div>
          </div>
          <div className="hero-status">
            <div><span>Machine state</span><strong>Running</strong></div>
            <div><span>Payment check</span><strong>Every 5 min</strong></div>
            <div><span>Kill-switch</span><strong>Active</strong></div>
          </div>
        </section>

        <section className="grid three" id="product">
          {features.map(f => (
            <div key={f.title} className="panel feature-panel">
              <div className="panel-body">
                <div className="feature-icon">{f.icon}</div>
                <span className="eyebrow">{f.eyebrow}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="panel" id="journey" style={{ marginTop: 20 }}>
          <div className="panel-header"><h2>Collection journey</h2><span>Phase 1 to Phase 2</span></div>
          <div className="panel-body"><JourneyStrip activeIndex={5} /></div>
        </section>

        <section className="landing-cta">
          <div>
            <h2>Ready to see the console?</h2>
            <p>Open the console to manage imports, campaign phases, payments and manager handoffs.</p>
          </div>
          <button type="button" className="primary" onClick={() => onNavigate("login")}>Open the demo</button>
        </section>
      </main>

      <footer className="landing-foot">
        <span>© {new Date().getFullYear()} Cegura Collections Console</span>
        <span>AI EMI Collection Platform</span>
      </footer>
    </div>
  );
}

