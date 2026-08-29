import { useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Landing from "./components/Landing.jsx";
import Login from "./components/Login.jsx";
import SignUp from "./components/SignUp.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Import from "./components/Import.jsx";
import Accounts from "./components/Accounts.jsx";
import AccountDetail from "./components/AccountDetail.jsx";
import Campaigns from "./components/Campaigns.jsx";
import Reports from "./components/Reports.jsx";
import Settings from "./components/Settings.jsx";
import Worklist from "./components/Worklist.jsx";
import Audit from "./components/Audit.jsx";
import ClientPortal from "./components/ClientPortal.jsx";
import CallConsole from "./components/CallConsole.jsx";
import { clearSession, loadSession, roleHome, saveSession } from "./auth.js";

const routeByView = {
  dashboard: "/dashboard",
  import: "/import",
  accounts: "/accounts",
  worklist: "/worklist",
  campaigns: "/campaigns",
  reports: "/reports",
  settings: "/settings",
  audit: "/audit",
  portal: "/portal"
};

const routeRoles = {
  "/dashboard": ["ops_admin"],
  "/import": ["ops_admin", "client"],
  "/accounts": ["ops_admin"],
  "/worklist": ["agent"],
  "/campaigns": ["ops_admin"],
  "/reports": ["ops_admin", "client"],
  "/settings": ["ops_admin"],
  "/audit": ["ops_admin"],
  "/portal": ["client"]
};

const viewByPath = Object.fromEntries(
  Object.entries(routeByView).map(([view, path]) => [path, view])
);

function canOpen(user, path) {
  const base = path.startsWith("/accounts/") ? "/accounts" : path.startsWith("/console/") ? "/worklist" : path;
  const roles = routeRoles[base];
  return !roles || roles.includes(user.roleKey || "ops_admin");
}

function Forbidden({ user }) {
  return (
    <div className="forbidden-state">
      <span className="eyebrow">403 Forbidden</span>
      <h1>This area is outside your role.</h1>
      <p>{user.name} is signed in as {user.role}. Use the sidebar to open the screens available for this role.</p>
      <a className="primary" href={roleHome[user.roleKey] || "/dashboard"}>Go to your dashboard</a>
    </div>
  );
}

function ProtectedRoute({ user, path, children }) {
  return canOpen(user, path) ? children : <Forbidden user={user} />;
}

function ConsoleShell({ user, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname.startsWith("/accounts/")
    ? "accounts"
    : location.pathname.startsWith("/console/")
      ? "worklist"
      : viewByPath[location.pathname] || "dashboard";

  function navigateView(view) {
    navigate(routeByView[view] || roleHome[user.roleKey] || "/dashboard");
  }

  return (
    <div className="app-shell">
      <Sidebar currentView={currentView} onNavigate={navigateView} user={user} onSignOut={onSignOut} />
      <main className="main">
        <Routes>
          <Route path="/home" element={<Navigate to={roleHome[user.roleKey] || "/dashboard"} replace />} />
          <Route path="/dashboard" element={<ProtectedRoute user={user} path="/dashboard"><Dashboard user={user} /></ProtectedRoute>} />
          <Route path="/import" element={<ProtectedRoute user={user} path="/import"><Import /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute user={user} path="/accounts"><Accounts /></ProtectedRoute>} />
          <Route path="/accounts/:id" element={<ProtectedRoute user={user} path="/accounts"><AccountDetail /></ProtectedRoute>} />
          <Route path="/worklist" element={<ProtectedRoute user={user} path="/worklist"><Worklist /></ProtectedRoute>} />
          <Route path="/console/:id" element={<ProtectedRoute user={user} path="/worklist"><CallConsole /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute user={user} path="/campaigns"><Campaigns /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute user={user} path="/reports"><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute user={user} path="/settings"><Settings user={user} /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute user={user} path="/audit"><Audit /></ProtectedRoute>} />
          <Route path="/portal" element={<ProtectedRoute user={user} path="/portal"><ClientPortal /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={roleHome[user.roleKey] || "/dashboard"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(loadSession);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function navigatePublic(route) {
    navigate(route === "landing" ? "/landing" : `/${route}`);
  }

  function safeNext(nextUser) {
    const next = searchParams.get("next");
    if (next && next.startsWith("/") && canOpen(nextUser, next.split("?")[0])) return next;
    return roleHome[nextUser.roleKey] || "/dashboard";
  }

  function handleAuthenticated(nextUser) {
    saveSession(nextUser);
    setUser(nextUser);
    navigate(safeNext(nextUser), { replace: true });
  }

  function handleSignOut() {
    clearSession();
    setUser(null);
    navigate("/login", { replace: true });
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing onNavigate={navigatePublic} />} />
        <Route path="/landing" element={<Landing onNavigate={navigatePublic} />} />
        <Route path="/login" element={<Login onAuthenticated={handleAuthenticated} onNavigate={navigatePublic} />} />
        <Route path="/signup" element={<SignUp onAuthenticated={handleAuthenticated} onNavigate={navigatePublic} />} />
        <Route path="/forgot" element={<Navigate to="/forgot-password" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword onNavigate={navigatePublic} />} />
        <Route path="*" element={<Navigate to={`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`} replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing onNavigate={navigatePublic} />} />
      <Route path="/landing" element={<Landing onNavigate={navigatePublic} />} />
      <Route path="/*" element={<ConsoleShell user={user} onSignOut={handleSignOut} />} />
    </Routes>
  );
}


