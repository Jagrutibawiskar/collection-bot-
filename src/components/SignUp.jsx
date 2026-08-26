import { useState } from "react";
import AuthLayout, { AuthField, AuthDivider, GoogleIcon } from "./AuthLayout.jsx";
import { signUp, ssoSignIn } from "../auth.js";

export default function SignUp({ onAuthenticated, onNavigate }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  function update(field) {
    return event => setForm(prev => ({ ...prev, [field]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = signUp(form);
    if (result.error) {
      setError(result.error);
      return;
    }
    onAuthenticated(result.user);
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Spin up a tenant and import your first ledger in minutes."
      artCaption="Three roles, one console — ops, agents and clients stay scoped to their own data."
      footer={<>Already have an account? <button type="button" className="link" onClick={() => onNavigate("login")}>Sign in</button></>}
    >
      <form className="auth-form-body" onSubmit={handleSubmit} noValidate>
        <AuthField label="Full name" autoComplete="name" placeholder="Admin Khan" value={form.name} onChange={update("name")} />
        <AuthField label="Work email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={update("email")} />
        <AuthField label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update("password")} />
        <AuthField label="Confirm password" type="password" autoComplete="new-password" placeholder="Repeat password" value={form.confirm} onChange={update("confirm")} />
        {error && <div className="auth-alert error">{error}</div>}
        <button type="submit" className="primary block">Create account</button>
      </form>

      <AuthDivider />

      <div className="auth-alt-actions">
        <button type="button" className="ghost block" onClick={() => onAuthenticated(ssoSignIn("Google").user)}>
          <GoogleIcon /> Continue with Google
        </button>
      </div>
    </AuthLayout>
  );
}
