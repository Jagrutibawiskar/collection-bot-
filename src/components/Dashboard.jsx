import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRoutes, money } from "../data.js";
import { getStats } from "../api.js";
import { Topbar, FunnelRow, ActivityItem, JourneyStrip, Panel } from "./ui.jsx";

const extraMetrics = [
  ["Total accounts", "6,352", "active portfolio", "stage=all"],
  ["Payments today", "248", "₹38.2L received", "lifecycle=paid"],
  ["SMS sent", "4,210", "98% delivered", "channel=sms"],
  ["WhatsApp delivered", "1,684", "71% read", "channel=whatsapp"],
  ["Voice connected", "631", "38% answered", "channel=voice"],
  ["AI outcomes", "42 PTP", "18 disputes", "lifecycle=ptp"],
  ["Agent outcomes", "126", "31 recovered", "lifecycle=escalated"],
  ["ROI", "3.8x", "estimated", ""]
];

const channelPerformance = [
  { channel: "SMS", sent: "4,210", rate: "98% delivered", cost: "₹0.12/msg", tone: "open" },
  { channel: "WhatsApp", sent: "1,684", rate: "71% read", cost: "₹0.28/msg", tone: "ptp" },
  { channel: "AI voice", sent: "631", rate: "38% answered", cost: "₹1.80/call", tone: "disputed" },
  { channel: "Manager", sent: "210", rate: "31 recovered", cost: "high touch", tone: "escalated" }
];

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mounted = useRef(false);

  function goAccounts(query = "") {
    navigate(`/accounts${query ? `?${query}` : ""}`);
  }

  function refreshStats() {
    setLoading(true);
    return getStats().then(data => {
      if (!mounted.current) return;
      setStats(data);
      setLastUpdated(new Date());
      setLoading(false);
    });
  }

  useEffect(() => {
    mounted.current = true;
    refreshStats().catch(() => mounted.current && setLoading(false));
    const interval = window.setInterval(() => refreshStats().catch(() => mounted.current && setLoading(false)), 60000);
    return () => { mounted.current = false; window.clearInterval(interval); };
  }, []);

  const refreshAction = <button type="button" className="primary" onClick={refreshStats} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</button>;

  if (!stats) return <><Topbar title={`Welcome back, ${user.name.split(" ")[0]}`} subtitle="Loading collections performance..." action={refreshAction} /><div className="panel skeleton-panel" /></>;

  const allKpis = [...stats.kpis.map((item, index) => ({ ...item, filter: ["", "lifecycle=paid", "lifecycle=open", "lifecycle=escalated"][index] || "" })), ...extraMetrics.map(([label, value, note, filter]) => ({ label, value, note, filter }))];

  return (
    <>
      <Topbar title="Executive Dashboard" subtitle={`Machine health, 13 core metrics, channel performance and live exceptions.${lastUpdated ? ` Last updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.` : ""}`} action={refreshAction} />

      <section className="dashboard-kpi-grid">
        {allKpis.map(item => <button key={item.label} type="button" className="panel kpi dashboard-kpi" onClick={() => goAccounts(item.filter)}><span>{item.label}</span><strong>{item.value}</strong><div className="delta">{item.note}</div></button>)}
      </section>

      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Collection movement, 30D" meta={`GET ${apiRoutes.stats}`}><div className="chart">{stats.chartBars.map((h, i) => <button type="button" key={i} className="bar" style={{ height: `${h}%` }} onClick={() => goAccounts(`range=30d&day=${i + 1}`)} aria-label={`Day ${i + 1} collections`} />)}</div></Panel>
        <Panel title="Funnel by stage" meta="click any stage"><div>{stats.funnelStages.map((stage, index) => <button key={stage.label} type="button" className="funnel-click" onClick={() => goAccounts(`stage=${index + 1}`)}><FunnelRow {...stage} /></button>)}</div></Panel>
      </section>

      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Channel performance today" meta="delivery, response, cost"><div className="channel-performance">{channelPerformance.map(row => <button key={row.channel} type="button" onClick={() => goAccounts(`channel=${row.channel.toLowerCase().replace(" ", "_")}`)}><span className={`pill ${row.tone}`}>{row.channel}</span><strong>{row.sent}</strong><em>{row.rate}</em><small>{row.cost}</small></button>)}</div></Panel>
        <Panel title="Needs attention" meta="live feed" bodyClassName="panel-body activity">{stats.attention.concat(stats.attention).slice(0, 8).map((item, index) => <ActivityItem key={`${item.time}-${index}`} {...item} />)}</Panel>
      </section>

      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Automation flow" meta="payment success is kill-switch"><JourneyStrip activeIndex={3} /></Panel>
        <Panel title="Dashboard actions" meta="doorways"><div className="dashboard-actions"><button type="button" className="primary" onClick={() => navigate("/import")}>Import ledger</button><button type="button" className="ghost" onClick={() => navigate("/worklist")}>Open manager queue</button><button type="button" className="ghost" onClick={() => navigate("/reports")}>Generate reports</button></div></Panel>
      </section>

      <Panel title="Uploaded files and campaign breakup" meta="click campaign row to filter accounts" style={{ marginTop: 16 }}><div className="table-wrap"><table><thead><tr><th>Campaign</th><th>Source file</th><th>Customers</th><th>Paid</th><th>WhatsApp phase</th><th>Voice phase</th><th>Human queue</th><th>Portfolio</th></tr></thead><tbody>{stats.campaigns.map(campaign => <tr key={campaign.name} className="clickable-row" onClick={() => goAccounts(`campaign=${encodeURIComponent(campaign.name)}`)}><td><strong>{campaign.name}</strong></td><td>{campaign.file}</td><td>{campaign.customers.toLocaleString()}</td><td><span className="pill paid">{campaign.paid.toLocaleString()}</span></td><td>{campaign.whatsapp.toLocaleString()}</td><td>{campaign.voice.toLocaleString()}</td><td><span className="pill escalated">{campaign.human.toLocaleString()}</span></td><td>{money(campaign.value)}</td></tr>)}</tbody></table></div></Panel>
    </>
  );
}
