import { journeySteps } from "../data.js";

export function Topbar({ title, subtitle, action }) {
  return (
    <div className="topbar">
      <div className="title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="top-actions">
        <select className="control" defaultValue="Client: Acme Utilities">
          <option>Client: Acme Utilities</option>
          <option>North Council</option>
          <option>Metro Telecom</option>
        </select>
        <select className="control" defaultValue="Last 30 days">
          <option>Last 30 days</option>
          <option>Today</option>
          <option>This month</option>
        </select>
        <button className="ghost">Admin ▾</button>
        {action}
      </div>
    </div>
  );
}

export function Kpi({ label, value, note }) {
  return (
    <div className="panel kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className="delta">{note}</div>
    </div>
  );
}

export function FunnelRow({ label, count, pct }) {
  return (
    <div className="funnel-row">
      <span>{label}</span>
      <div className="funnel-track">
        <div className="funnel-fill" style={{ width: `${pct}%` }} />
      </div>
      <strong>{count}</strong>
    </div>
  );
}

export function ActivityItem({ time, text, tag, tone = "" }) {
  return (
    <div className="activity-item">
      <span className="muted">{time}</span>
      <span>{text}</span>
      <span className={`pill ${tone}`}>{tag}</span>
    </div>
  );
}

export function JourneyStrip({ activeIndex = 6 }) {
  return (
    <div className="journey">
      {journeySteps.map(([day, channel], i) => (
        <div key={day} className={`journey-step ${i === activeIndex ? "active" : ""}`}>
          <b>{day}</b>
          <span>{channel}</span>
        </div>
      ))}
    </div>
  );
}

export function Panel({ title, meta, action, bodyClassName = "panel-body", className = "", style, children }) {
  return (
    <div className={`panel ${className}`.trim()} style={style}>
      {(title || meta || action) && (
        <div className="panel-header">
          {title && <h2>{title}</h2>}
          {meta && <span>{meta}</span>}
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
