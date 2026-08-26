import { apiRoutes, nav } from "../data.js";

export default function Sidebar({ currentView, onNavigate, user, onSignOut }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">C</div>
        <div><strong>Cegura</strong><span>Collections Console</span></div>
      </div>
      <div className="tenant-card">
        <span>Active tenant</span>
        <strong>{user.tenant}</strong>
        <small>ops_admin · Phase 1</small>
      </div>
      <div className="nav-group-label">Ops shell</div>
      <nav>
        {nav.map(({ label, key, screen, icon }) => (
          <button
            key={key}
            type="button"
            className={`nav-button ${currentView === key ? "active" : ""}`}
            onClick={() => onNavigate(key)}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
            <span className="nav-screen">{screen}</span>
          </button>
        ))}
      </nav>
      <div className="nav-group-label">API contract</div>
      <div className="sidebar-card">
        <div>
          <div className="muted">Mocked now, ready for Flask/FastAPI routes.</div>
          <div className="route-code" style={{ marginTop: 10 }}>{apiRoutes.accounts}</div>
          <div className="route-code">{apiRoutes.stats}</div>
        </div>
      </div>
      <div className="sidebar-footer">
        <div className="avatar">{user.initials}</div>
        <div><strong>{user.name}</strong><span>{user.role}</span></div>
        <button type="button" className="sign-out" onClick={onSignOut} title="Sign out">⏻</button>
      </div>
    </aside>
  );
}
