import { nav } from "../data.js";

export default function Sidebar({ currentView, onNavigate, user, onSignOut }) {
  const visibleNav = nav.filter(item => !item.roles || item.roles.includes(user.roleKey || "ops_admin"));

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">C</div>
        <div><strong>Cegura</strong><span>Collections Console</span></div>
      </div>

      <nav aria-label="Main navigation">
        {visibleNav.map(({ label, key, icon }) => (
          <button key={key} type="button" className={`nav-button ${currentView === key ? "active" : ""}`} onClick={() => onNavigate(key)}>
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">{user.initials}</div>
        <div><strong>{user.name}</strong><span>{user.role}</span></div>
        <button type="button" className="sign-out" onClick={onSignOut} title="Sign out">⏻</button>
      </div>
    </aside>
  );
}
