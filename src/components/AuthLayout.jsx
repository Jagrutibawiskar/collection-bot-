export default function AuthLayout({ title, subtitle, children, footer, artCaption }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-art" aria-hidden="true">
          <div className="auth-art-wave" />
          <div className="auth-art-copy">
            <span className="eyebrow">Cegura Collections</span>
            <p>{artCaption}</p>
          </div>
        </div>
        <div className="auth-form-side">
          <div className="auth-form">
            <div className="auth-brand">
              <div className="brand-mark">C</div>
              <span>Cegura</span>
            </div>
            <h1>{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
            {children}
            {footer && <div className="auth-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({ label, error, ...props }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <input className={`control ${error ? "invalid" : ""}`} {...props} />
    </label>
  );
}

export function AuthDivider({ children = "or" }) {
  return <div className="auth-divider"><span>{children}</span></div>;
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.6-2-6.5-4.8H1.7v3C3.6 21.3 7.5 24 12 24z" />
      <path fill="#FBBC05" d="M5.5 14.6a7.2 7.2 0 0 1 0-4.6v-3H1.7a12 12 0 0 0 0 10.6l3.8-3z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.5 0 3.6 2.7 1.7 6.6l3.8 3C6.4 6.8 9 4.8 12 4.8z" />
    </svg>
  );
}
