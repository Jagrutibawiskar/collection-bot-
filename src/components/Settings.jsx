import { useState } from "react";
import { Kpi, Panel, Topbar } from "./ui.jsx";

const initialUsers = [
  { name: "Admin Khan", email: "demo@cegura.io", role: "ops_admin", status: "Active" },
  { name: "M. Stone", email: "agent@cegura.io", role: "agent", status: "Active" },
  { name: "Client Viewer", email: "client@acme.test", role: "client", status: "Invited" }
];

const initialChannels = [
  { key: "sms", label: "SMS", provider: "Twilio / Kaleyra", connected: true },
  { key: "whatsapp", label: "WhatsApp", provider: "Meta Business API", connected: true },
  { key: "voice", label: "Voice", provider: "Twilio / Exotel", connected: false },
  { key: "payments", label: "Payments", provider: "Stripe + Razorpay", connected: true }
];

export default function Settings({ user }) {
  const [users, setUsers] = useState(initialUsers);
  const [channels, setChannels] = useState(initialChannels);
  const [inviteEmail, setInviteEmail] = useState("");
  const [notice, setNotice] = useState("");

  function inviteUser(event) {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setUsers(prev => [...prev, { name: "New teammate", email, role: "agent", status: "Invited" }]);
    setInviteEmail("");
    setNotice(`Invite queued for ${email}.`);
  }

  function updateRole(email, role) {
    setUsers(prev => prev.map(item => item.email === email ? { ...item, role } : item));
    setNotice(`Role updated for ${email}.`);
  }

  function toggleChannel(key) {
    setChannels(prev => prev.map(item => item.key === key ? { ...item, connected: !item.connected } : item));
    setNotice("Channel setting updated.");
  }

  return (
    <>
      <Topbar title="Settings" subtitle="Users, roles, tenants and channel configuration." />

      <section className="grid three">
        <Kpi label="Tenant" value={user.tenant} note="selected client scope" />
        <Kpi label="Users" value={users.length.toString()} note="active and invited" />
        <Kpi label="Connected channels" value={channels.filter(c => c.connected).length.toString()} note="ready for campaign use" />
      </section>

      {notice && <div className="auth-alert ok settings-notice">{notice}</div>}

      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="User management" meta="role-based access">
          <form className="settings-invite" onSubmit={inviteUser}>
            <input className="control" type="email" placeholder="teammate@company.com" value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} />
            <button type="submit" className="primary">Invite user</button>
          </form>
          <div className="settings-list">
            {users.map(item => (
              <div key={item.email} className="settings-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.email}</span>
                </div>
                <select className="control" value={item.role} onChange={event => updateRole(item.email, event.target.value)}>
                  <option value="ops_admin">ops_admin</option>
                  <option value="agent">agent</option>
                  <option value="client">client</option>
                </select>
                <span className={`pill ${item.status === "Active" ? "paid" : "open"}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Channel connections" meta="demo toggles">
          <div className="settings-list">
            {channels.map(channel => (
              <div key={channel.key} className="settings-row channel-row">
                <div>
                  <strong>{channel.label}</strong>
                  <span>{channel.provider}</span>
                </div>
                <button type="button" className={`channel-toggle ${channel.connected ? "active" : ""}`} onClick={() => toggleChannel(channel.key)}>
                  {channel.connected ? "Connected" : "Disconnected"}
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}
