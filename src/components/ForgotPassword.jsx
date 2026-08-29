import { useState } from "react";
import AuthLayout, { AuthField } from "./AuthLayout.jsx";
import { isEmail } from "../auth.js";

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSent(true);
  }

  return (
    <AuthLayout
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={sent
        ? `We sent reset instructions to ${email.trim()}.`
        : "Enter the email tied to your account and we'll send a reset link."}
      artCaption="Kill-switch, audit trail and tenant scoping stay intact through every recovery."
      footer={<>Remembered it? <button type="button" className="link" onClick={() => onNavigate("login")}>Back to sign in</button></>}
    >
      {sent ? (
        <div className="auth-form-body">
          <div className="auth-alert ok">Reset link valid for 30 minutes.</div>
          <button type="button" className="primary block" onClick={() => onNavigate("login")}>Back to sign in</button>
          <button type="button" className="link" onClick={() => setSent(false)}>Use a different email</button>
        </div>
      ) : (
        <form className="auth-form-body" onSubmit={handleSubmit} noValidate>
          <AuthField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={event => setEmail(event.target.value)}
            error={Boolean(error)}
          />
          {error && <div className="auth-alert error">{error}</div>}
          <button type="submit" className="primary block">Send reset link</button>
        </form>
      )}
    </AuthLayout>
  );
}

