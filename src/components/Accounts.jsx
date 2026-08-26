import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lifecycleLabels, money, dayOffsetLabel } from "../data.js";
import { getAccounts } from "../api.js";
import { Topbar } from "./ui.jsx";

const worklistLifecycles = ["escalated", "disputed", "ptp"];

export default function Accounts({ worklist = false }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [lifecycle, setLifecycle] = useState("all");
  const [stage, setStage] = useState("all");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAccounts().then(data => {
      if (!active) return;
      setAccounts(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    const base = worklist ? accounts.filter(a => worklistLifecycles.includes(a.lifecycle)) : accounts;
    const term = query.trim().toLowerCase();
    return base.filter(a => {
      const matchesSearch = !term || [a.name, a.id, a.client, a.channel, a.agent].some(field => field.toLowerCase().includes(term));
      const matchesLifecycle = lifecycle === "all" || a.lifecycle === lifecycle;
      const matchesStage = stage === "all" || String(a.stage) === stage;
      return matchesSearch && matchesLifecycle && matchesStage;
    });
  }, [accounts, lifecycle, stage, worklist, query]);

  function exportCsv() {
    const header = ["id", "name", "client", "amount", "due", "day_offset", "stage", "lifecycle", "channel", "agent"];
    const body = rows.map(a => [
      a.id,
      a.name,
      a.client,
      money(a.amount),
      a.due,
      dayOffsetLabel(a.offset),
      `S${a.stage}`,
      lifecycleLabels[a.lifecycle],
      a.channel,
      a.agent
    ]);
    const csv = [header, ...body]
      .map(line => line.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${worklist ? "worklist" : "accounts"}-export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Topbar
        title={worklist ? "Agent Worklist" : "Accounts"}
        subtitle={worklist
          ? "Assigned escalations, callbacks, disputes and PTP follow-up."
          : "The workhorse table for lifecycle, channel and tenant filtering."}
      />
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>{worklist ? "Queue" : "All accounts"}</h2>
            <span className="muted">{rows.length} visible · {accounts.length} total</span>
          </div>
          <div className="top-actions account-toolbar">
            <input
              className="control"
              placeholder="Search customer, invoice, mobile"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
            <select className="control" value={lifecycle} onChange={event => setLifecycle(event.target.value)}>
              <option value="all">All lifecycle</option>
              {Object.entries(lifecycleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select className="control" value={stage} onChange={event => setStage(event.target.value)}>
              <option value="all">All stages</option>
              <option value="1">Stage 1</option>
              <option value="2">Stage 2</option>
              <option value="3">Stage 3</option>
              <option value="4">Stage 4</option>
            </select>
            <button type="button" className="ghost" onClick={() => { setQuery(""); setLifecycle("all"); setStage("all"); }}>Reset</button>
            <button type="button" className="primary" onClick={exportCsv} disabled={rows.length === 0}>Export</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th><th>Client</th><th>Amount</th><th>Due date</th><th>Day</th>
                <th>Stage</th><th>Lifecycle</th><th>Last touch</th><th>Agent</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9">Loading accounts...</td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan="9">No accounts match this filter.</td>
                </tr>
              )}
              {rows.map(a => (
                <tr
                  key={a.id}
                  className="clickable-row"
                  tabIndex="0"
                  onClick={() => navigate(`/accounts/${a.id}`)}
                  onKeyDown={event => {
                    if (event.key === "Enter") navigate(`/accounts/${a.id}`);
                  }}
                >
                  <td><strong>{a.name}</strong><div className="muted">{a.id}</div></td>
                  <td>{a.client}</td>
                  <td>{money(a.amount)}</td>
                  <td>{a.due}</td>
                  <td>{dayOffsetLabel(a.offset)}</td>
                  <td>S{a.stage}</td>
                  <td><span className={`pill ${a.lifecycle}`}>{lifecycleLabels[a.lifecycle]}</span></td>
                  <td>{a.channel}</td>
                  <td>{a.agent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
