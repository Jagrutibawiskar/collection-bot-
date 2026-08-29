import { useState } from "react";
import { Kpi, Panel, Topbar } from "./ui.jsx";

const initialUsers = [
  { name: "Admin Khan", email: "demo@cegura.io", role: "ops_admin", status: "Active" },
  { name: "M. Stone", email: "agent@cegura.io", role: "agent", status: "Active" },
  { name: "Client Viewer", email: "client@finance.test", role: "client", status: "Invited" }
];

const clients = ["L&T Finance", "Mahindra Finance", "TVS Credit", "Bajaj Finance"];
const channels = [
  { key: "sms", label: "SMS", provider: "Kaleyra", connected: true },
  { key: "whatsapp", label: "WhatsApp", provider: "Meta Business API", connected: true, approval: "Approved" },
  { key: "voice", label: "AI Voice", provider: "Exotel", connected: false },
  { key: "payments", label: "Payments", provider: "Razorpay", connected: true }
];
const providers = ["Razorpay", "Stripe", "GoCardless", "Worldpay"];
const tabs = ["Users", "Clients", "Channels", "Payments", "Retention"];

export default function Settings({ user }) {
  const [activeTab, setActiveTab] = useState("Users");
  const [users, setUsers] = useState(initialUsers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [template, setTemplate] = useState("Hi {name}, your EMI of {amount} is due on {due_date}. Pay here: {payment_link}");
  const [retention, setRetention] = useState(24);

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

  function segmentCount(text) {
    return Math.max(1, Math.ceil(text.length / 160));
  }

  return (
    <>
      <Topbar title="Settings" subtitle="Users, clients, channels, payment providers and retention controls." />
      <section className="grid three"><Kpi label="Tenant" value={user.tenant} note="selected scope" /><Kpi label="Users" value={users.length.toString()} note="active and invited" /><Kpi label="Retention" value={`${retention}m`} note="audit and communication logs" /></section>
      {notice && <div className="auth-alert ok settings-notice">{notice}</div>}

      <Panel title="Configuration" meta="tabbed settings" style={{ marginTop: 16 }}>
        <div className="tabs settings-tabs">{tabs.map(tab => <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>

        {activeTab === "Users" && <div className="tab-body"><form className="settings-invite" onSubmit={inviteUser}><input className="control" type="email" placeholder="teammate@company.com" value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} /><button type="submit" className="primary">Invite user</button></form><div className="settings-list">{users.map(item => <div key={item.email} className="settings-row"><div><strong>{item.name}</strong><span>{item.email}</span></div><select className="control" value={item.role} onChange={event => updateRole(item.email, event.target.value)}><option value="ops_admin">ops_admin</option><option value="agent">agent</option><option value="client">client</option></select><span className={`pill ${item.status === "Active" ? "paid" : "open"}`}>{item.status}</span></div>)}</div></div>}

        {activeTab === "Clients" && <div className="tab-body settings-list">{clients.map(client => <div key={client} className="settings-row"><div><strong>{client}</strong><span>client_id: {client.toLowerCase().replaceAll(" ", "_").replaceAll("&", "and")}</span></div><span className="pill paid">Active</span><button className="ghost" type="button" onClick={() => setNotice(`${client} selected.`)}>Open</button></div>)}</div>}

        {activeTab === "Channels" && <div className="tab-body"><div className="settings-list">{channels.map(channel => <div key={channel.key} className="settings-row channel-row"><div><strong>{channel.label}</strong><span>{channel.provider}{channel.approval ? ` · Meta status: ${channel.approval}` : ""}</span></div><span className={`pill ${channel.connected ? "paid" : "open"}`}>{channel.connected ? "Connected" : "Disconnected"}</span></div>)}</div><div className="template-editor"><label><span>WhatsApp/SMS template preview</span><textarea className="control note-box" value={template} onChange={event => setTemplate(event.target.value)} /></label><div className="auth-alert ok">{template.length} characters · {segmentCount(template)} SMS segment(s). Merge fields: {"{name}"}, {"{amount}"}, {"{due_date}"}, {"{payment_link}"}</div></div></div>}

        {activeTab === "Payments" && <div className="tab-body settings-list">{providers.map(provider => <div key={provider} className="settings-row"><div><strong>{provider}</strong><span>Payment provider connection</span></div><span className={`pill ${provider === "Razorpay" ? "paid" : "open"}`}>{provider === "Razorpay" ? "Connected" : "Available"}</span><button className="ghost" type="button" onClick={() => setNotice(`${provider} test webhook sent.`)}>Test webhook</button></div>)}</div>}

        {activeTab === "Retention" && <div className="tab-body"><div className="settings-row"><div><strong>Data retention</strong><span>Communication logs, audit events and import records.</span></div><input className="control" type="number" min="6" max="84" value={retention} onChange={event => setRetention(Number(event.target.value))} /><span className="pill open">Months</span></div><div className="compliance-list" style={{ marginTop: 14 }}><div><strong>Audit exports</strong><span>Export actions are logged.</span></div><div><strong>Recording access</strong><span>Playback should create an audit event.</span></div><div><strong>Client scope</strong><span>Every record remains tenant-bound.</span></div></div></div>}
      </Panel>
    </>
  );
}
