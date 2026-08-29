import { JourneyStrip } from "./ui.jsx";

const features = [
  { eyebrow: "01 / Import", title: "Clean ledger intake", body: "Upload EMI files, map columns, validate rows and start campaigns only after review." },
  { eyebrow: "02 / Automate", title: "Day-offset recovery", body: "D-7 and D-4 WhatsApp, D-5 to D-3 SMS, D-1 and D-Day AI voice with automatic stop rules." },
  { eyebrow: "03 / Escalate", title: "Human handoff", body: "Overdue, disputed and broken promise cases move into a focused manager worklist." }
];

const metrics = [
  ["₹21.21 Cr", "portfolio tracked"],
  ["98%", "SMS delivered"],
  ["42", "PTP captured"],
  ["5 min", "payment sync"]
];

export default function Landing({ onNavigate }) {
  return (
    <div className="landing-page premium-landing">
      <header className="landing-nav premium-nav">
        <div className="auth-brand">
          <div className="brand-mark">C</div>
          <span>Cegura</span>
        </div>
        <nav className="landing-links">
          <a href="#product">Product</a>
          <a href="#journey">Journey</a>
          <a href="#reports">Reports</a>
        </nav>
        <div className="landing-nav-actions">
          <button type="button" className="ghost" onClick={() => onNavigate("login")}>Sign in</button>
          <button type="button" className="primary" onClick={() => onNavigate("signup")}>Create account</button>
        </div>
      </header>

      <main className="landing-main premium-main">
        <section className="landing-hero public premium-hero">
          <div className="premium-hero-copy">
            <span className="eyebrow">AI EMI Collection Platform</span>
            <h1>Cegura Collections Console</h1>
            <p>One command center for ledger imports, WhatsApp reminders, SMS nudges, AI voice calls, payment stops and manager handoffs.</p>
            <div className="hero-actions">
              <button type="button" className="primary" onClick={() => onNavigate("signup")}>Create account</button>
              <button type="button" className="ghost" onClick={() => onNavigate("login")}>Login to dashboard</button>
            </div>
          </div>
          <div className="landing-console-preview" aria-label="Collections console preview">
            <div className="preview-top"><span /> <b>Live recovery desk</b><em>Running</em></div>
            <div className="preview-grid">
              {metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
            </div>
            <div className="preview-flow"><JourneyStrip activeIndex={4} /></div>
          </div>
        </section>

        <section className="landing-feature-band" id="product">
          {features.map(feature => <article key={feature.title} className="landing-feature-card"><span className="eyebrow">{feature.eyebrow}</span><h3>{feature.title}</h3><p>{feature.body}</p></article>)}
        </section>

        <section className="landing-split" id="journey">
          <div>
            <span className="eyebrow">Workflow</span>
            <h2>From reminder to recovery, without losing control.</h2>
            <p>Operations can inspect every stage, agents get only the accounts that need human action, and clients can review high-level performance from their own portal.</p>
          </div>
          <div className="landing-checks">
            <span>Role based login for ops, agents and clients</span>
            <span>2FA-ready operations access</span>
            <span>Payment, dispute and opt-out stop rules</span>
            <span>Exportable audit and reporting trail</span>
          </div>
        </section>

        <section className="landing-cta premium-cta" id="reports">
          <div>
            <h2>Open the demo console</h2>
            <p>Start with login, then move into dashboard, imports, accounts, campaigns, reports and audit pages.</p>
          </div>
          <button type="button" className="primary" onClick={() => onNavigate("login")}>Open login</button>
        </section>
      </main>

      <footer className="landing-foot">
        <span>© {new Date().getFullYear()} Cegura Collections Console</span>
        <span>Built for finance collection operations</span>
      </footer>
    </div>
  );
}
