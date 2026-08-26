import { useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Landing from "./components/Landing.jsx";
import Login from "./components/Login.jsx";
import SignUp from "./components/SignUp.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import Home from "./components/Home.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Import from "./components/Import.jsx";
import Accounts from "./components/Accounts.jsx";
import AccountDetail from "./components/AccountDetail.jsx";
import Campaigns from "./components/Campaigns.jsx";
import Reports from "./components/Reports.jsx";
import Settings from "./components/Settings.jsx";
import { clearSession, loadSession, saveSession } from "./auth.js";

const routeByView = {
  home: "/home",
  dashboard: "/dashboard",
  import: "/import",
  accounts: "/accounts",
  worklist: "/worklist",
  campaigns: "/campaigns",
  reports: "/reports",
  settings: "/settings"
};

const viewByPath = Object.fromEntries(
  Object.entries(routeByView).map(([view, path]) => [path, view])
);

function ConsoleShell({ user, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname.startsWith("/accounts/")
    ? "accounts"
    : viewByPath[location.pathname] || "dashboard";

  function navigateView(view) {
    navigate(routeByView[view] || "/dashboard");
  }

  return (
    <div className="app-shell">
      <Sidebar currentView={currentView} onNavigate={navigateView} user={user} onSignOut={onSignOut} />
      <main className="main">
        <Routes>
          <Route path="/home" element={<Home onNavigate={navigateView} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/import" element={<Import />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />
          <Route path="/worklist" element={<Accounts worklist />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(loadSession);
  const navigate = useNavigate();

  function navigatePublic(route) {
    navigate(route === "landing" ? "/" : `/${route}`);
  }

  function handleAuthenticated(nextUser) {
    saveSession(nextUser);
    setUser(nextUser);
    navigate("/dashboard", { replace: true });
  }

  function handleSignOut() {
    clearSession();
    setUser(null);
    navigate("/", { replace: true });
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing onNavigate={navigatePublic} />} />
        <Route path="/login" element={<Login onAuthenticated={handleAuthenticated} onNavigate={navigatePublic} />} />
        <Route path="/signup" element={<SignUp onAuthenticated={handleAuthenticated} onNavigate={navigatePublic} />} />
        <Route path="/forgot" element={<ForgotPassword onNavigate={navigatePublic} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<ConsoleShell user={user} onSignOut={handleSignOut} />} />
    </Routes>
  );
}
