import { useState } from "react";
import AuthLayout, { AuthField, AuthDivider, GoogleIcon } from "./AuthLayout.jsx";
import { signIn, ssoSignIn, demoCredentials, isEmail } from "../auth.js";

export default function Login({ onAuthenticated, onNavigate }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function update(field) {
    return event => setForm(prev => ({ ...prev, [field]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = signIn(form);
    if (result.error) {
      setError(result.error);
      return;
    }
    onAuthenticated(result.user);
  }

  function magicLink() {
    if (!isEmail(form.email)) {
      setError("Enter your email first, then request the magic link.");
      return;
    }
    setError("");
    setNotice(`Magic link sent to ${form.email.trim()} (demo — no real email goes out).`);
  }

  function useDemo() {
    setForm({ ...demoCredentials });
    setError("");
    setNotice("");
  }

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Recover faster, close every case cleanly."
      artCaption="Ledger in, reminders out, payments reconciled every five minutes."
      footer={<>Don’t have an account yet? <button type="button" className="link" onClick={() => onNavigate("signup")}>Sign up</button></>}
    >
      <form className="auth-form-body" onSubmit={handleSubmit} noValidate>
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={update("email")}
          error={Boolean(error)}
        />
        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={update("password")}
          error={Boolean(error)}
        />
        <div className="auth-row">
          <button type="button" className="link" onClick={() => onNavigate("forgot")}>Forgot password?</button>
        </div>
        {error && <div className="auth-alert error">{error}</div>}
        {notice && <div className="auth-alert ok">{notice}</div>}
        <button type="submit" className="primary block">Sign in</button>
      </form>

      <AuthDivider />

      <div className="auth-alt-actions">
        <button type="button" className="ghost block" onClick={() => onAuthenticated(ssoSignIn("Google").user)}>
          <GoogleIcon /> Sign in with Google
        </button>
        <button type="button" className="ghost block" onClick={magicLink}>
          <span aria-hidden="true">✦</span> Magic email link
        </button>
      </div>

      <button type="button" className="demo-hint" onClick={useDemo}>
        Demo login → <strong>{demoCredentials.email}</strong> / <strong>{demoCredentials.password}</strong> (click to fill)
      </button>
    </AuthLayout>
  );
}
