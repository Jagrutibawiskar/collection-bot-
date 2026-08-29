import { useState } from "react";
import AuthLayout, { AuthField, AuthDivider, GoogleIcon } from "./AuthLayout.jsx";
import { signIn, ssoSignIn, demoCredentials, isEmail } from "../auth.js";

export default function Login({ onAuthenticated, onNavigate }) {
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [needs2fa, setNeeds2fa] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const locked = attempts >= 5;

  function update(field) {
    return event => setForm(prev => ({ ...prev, [field]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (locked) {
      setError("Account locked after 5 attempts. Contact your Cegura admin to unlock access.");
      return;
    }
    const result = signIn(form);
    if (result.needs2fa) setNeeds2fa(true);
    if (result.error) {
      setAttempts(prev => prev + 1);
      setError(result.error);
      return;
    }
    setAttempts(0);
    onAuthenticated(result.user);
  }

  function magicLink() {
    if (!isEmail(form.email)) {
      setError("Enter your email first, then request the magic link.");
      return;
    }
    setError("");
    setNotice(`Magic link sent to ${form.email.trim()}.`);
  }

  function useDemo() {
    setForm({ email: demoCredentials.email, password: demoCredentials.password, otp: demoCredentials.otp });
    setNeeds2fa(true);
    setError("");
    setNotice("Demo admin code filled. Use 123456 for ops admin 2FA.");
  }

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Sign in to continue to your role-based collections workspace."
      artCaption="Ledger in, reminders out, payments reconciled cleanly."
      footer={<>Don’t have an account yet? <button type="button" className="link" onClick={() => onNavigate("signup")}>Sign up</button></>}
    >
      <form className="auth-form-body" onSubmit={handleSubmit} noValidate>
        <AuthField label="Email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={update("email")} error={Boolean(error)} />
        <AuthField label="Password" type="password" autoComplete="current-password" placeholder="At least 8 characters" value={form.password} onChange={update("password")} error={Boolean(error)} />
        {needs2fa && <AuthField label="Security code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={form.otp} onChange={update("otp")} error={Boolean(error)} />}
        <div className="auth-row"><button type="button" className="link" onClick={() => onNavigate("forgot-password")}>Forgot password?</button></div>
        {locked && <div className="auth-alert error">Account locked after 5 attempts. Unlock path: ask an ops admin to reset access from Settings → Users.</div>}
        {error && !locked && <div className="auth-alert error">{error}</div>}
        {notice && <div className="auth-alert ok">{notice}</div>}
        <button type="submit" className="primary block" disabled={locked}>{needs2fa ? "Verify and sign in" : "Sign in"}</button>
      </form>

      <AuthDivider />

      <div className="auth-alt-actions">
        <button type="button" className="ghost block" onClick={() => onAuthenticated(ssoSignIn("Google", "ops_admin").user)}><GoogleIcon /> Sign in with Google</button>
        <button type="button" className="ghost block" onClick={magicLink}><span aria-hidden="true">✦</span> Magic email link</button>
      </div>

      <div className="demo-login-grid">
        <button type="button" className="demo-hint" onClick={useDemo}>Ops demo: {demoCredentials.email}</button>
        <button type="button" className="demo-hint" onClick={() => setForm({ email: "agent@cegura.io", password: "agent1234", otp: "" })}>Agent demo</button>
        <button type="button" className="demo-hint" onClick={() => setForm({ email: "client@cegura.io", password: "client1234", otp: "" })}>Client demo</button>
      </div>
    </AuthLayout>
  );
}
