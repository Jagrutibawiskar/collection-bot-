import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { lifecycleLabels, money, dayOffsetLabel, zoneClass } from "../data.js";
import { getAccounts, getWorklist, patchAccount } from "../api.js";
import { Topbar, LifecyclePill, StageTrack, DayOffsetChip, ChannelBadge } from "./ui.jsx";

const worklistLifecycles = ["escalated", "disputed", "ptp", "unreachable"];
const pageSizes = [5, 10, 25, 50];

function maskMobile(value = "+91 98765 43210") {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "+91 ...";
  return `+91 ... ${digits.slice(-4)}`;
}

export default function Accounts({ worklist = false }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const lifecycle = searchParams.get("lifecycle") || "all";
  const stage = searchParams.get("stage") || "all";
  const channel = searchParams.get("channel") || "all";
  const agent = searchParams.get("agent") || "all";
  const density = searchParams.get("density") || "comfortable";
  const page = Number(searchParams.get("page") || 1);
  const perPage = Number(searchParams.get("per_page") || 10);
  const [selected, setSelected] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "all" || value === "comfortable") next.delete(key);
    else next.set(key, value);
    if (!["page", "per_page"].includes(key)) next.set("page", "1");
    setSearchParams(next, { replace: true });
  }

  function updatePage(value) {
    updateFilter("page", String(value));
  }

  function updatePerPage(value) {
    const next = new URLSearchParams(searchParams);
    next.set("per_page", String(value));
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    const loader = worklist ? getWorklist : getAccounts;
    loader({ page, per_page: perPage, q: query, lifecycle, stage, channel, agent }).then(result => {
      if (!active) return;
      const data = Array.isArray(result) ? result : result?.data || [];
      setAccounts(data);
      setMeta(result?.meta || { page, per_page: perPage, total: data.length });
      setLoading(false);
    });
    return () => { active = false; };
  }, [worklist, page, perPage, query, lifecycle, stage, channel, agent]);

  const filteredRows = useMemo(() => {
    const base = worklist ? accounts.filter(a => worklistLifecycles.includes(a.lifecycle) || a.offset > 0) : accounts;
    const term = query.trim().toLowerCase();
    return base.filter(a => {
      const searchable = [a.name, a.id, a.client, a.channel, a.agent, a.campaign].filter(Boolean);
      const matchesSearch = !term || searchable.some(field => field.toLowerCase().includes(term));
      const matchesLifecycle = lifecycle === "all" || a.lifecycle === lifecycle;
      const matchesStage = stage === "all" || String(a.stage) === stage;
      const matchesChannel = channel === "all" || a.channel === channel;
      const matchesAgent = agent === "all" || a.agent === agent;
      return matchesSearch && matchesLifecycle && matchesStage && matchesChannel && matchesAgent;
    }).sort((a, b) => worklist ? a.offset - b.offset : b.offset - a.offset);
  }, [accounts, lifecycle, stage, channel, agent, worklist, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const rows = filteredRows.slice((page - 1) * perPage, page * perPage);
  const allVisibleSelected = rows.length > 0 && rows.every(row => selected.includes(row.id));
  const agents = [...new Set(accounts.map(a => a.agent).filter(Boolean))];
  const channels = [...new Set(accounts.map(a => a.channel).filter(Boolean))];

  const chips = [
    query && ["Search", query, () => updateFilter("q", "")],
    lifecycle !== "all" && ["Lifecycle", lifecycleLabels[lifecycle], () => updateFilter("lifecycle", "all")],
    stage !== "all" && ["Stage", `Stage ${stage}`, () => updateFilter("stage", "all")],
    channel !== "all" && ["Channel", channel, () => updateFilter("channel", "all")],
    agent !== "all" && ["Agent", agent, () => updateFilter("agent", "all")]
  ].filter(Boolean);

  function updateAccount(id, patch, message) {
    setAccounts(prev => prev.map(account => account.id === id ? { ...account, ...patch } : account));
    patchAccount(id, patch);
    setToast(message);
  }

  function bulkPatch(patch, message) {
    selected.forEach(id => patchAccount(id, patch));
    setAccounts(prev => prev.map(account => selected.includes(account.id) ? { ...account, ...patch } : account));
    setToast(message);
    setSelected([]);
  }

  function toggleRow(event, id) {
    event.stopPropagation();
    setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  }

  function toggleVisible(event) {
    event.stopPropagation();
    setSelected(prev => allVisibleSelected ? prev.filter(id => !rows.some(row => row.id === id)) : [...new Set([...prev, ...rows.map(row => row.id)])]);
  }

  function startCall(event, account) {
    event.stopPropagation();
    updateAccount(account.id, { channel: "agent", agent: account.agent === "Unassigned" ? "A. Khan" : account.agent }, `Call started for ${account.name}.`);
  }

  function markPaid(event, account) {
    event.stopPropagation();
    updateAccount(account.id, { lifecycle: "paid", remainingBalance: 0, pendingEmis: 0, channel: "payment", agent: "Closed" }, `${account.name} marked paid. Automation stopped.`);
  }

  function resetFilters() {
    setSearchParams({}, { replace: true });
  }

  function exportCsv() {
    const source = selected.length ? filteredRows.filter(a => selected.includes(a.id)) : filteredRows;
    if (source.length > 10000) {
      setToast("Large export queued. You will receive the file by email.");
      return;
    }
    const header = ["id", "name", "company", "campaign", "emi", "remaining", "due", "day_offset", "stage", "lifecycle", "zone", "agent"];
    const body = source.map(a => [a.id, a.name, a.client, a.campaign, money(a.emiAmount || a.amount), money(a.remainingBalance ?? a.amount), a.due, dayOffsetLabel(a.offset), `S${a.stage}`, lifecycleLabels[a.lifecycle], zoneClass(a), a.agent]);
    const csv = [header, ...body].map(line => line.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${worklist ? "manager-worklist" : "accounts"}-export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Topbar title={worklist ? "Manager Handoff Queue" : "Customer Accounts"} subtitle={worklist ? "Overdue customers sorted from recently overdue to older red-zone accounts." : "URL-synced account table with filters, bulk actions, stages and pagination."} />
      {worklist && <div className="zone-legend"><span><b className="zone-dot white" /> Recently overdue</span><span><b className="zone-dot orange" /> Aging overdue</span><span><b className="zone-dot red" /> Red zone</span><span><b className="zone-dot green" /> Paid / closed</span></div>}
      {toast && <div className="auth-alert ok queue-toast">{toast}</div>}
      {selected.length > 0 && <div className="bulk-bar"><strong>{selected.length} selected</strong><button className="ghost" type="button" onClick={() => bulkPatch({ paused: true }, "Selected campaigns paused.")}>Pause campaign</button><button className="ghost" type="button" onClick={() => bulkPatch({ agent: "A. Khan", lifecycle: "escalated" }, "Selected accounts assigned.")}>Assign to A. Khan</button><button className="primary" type="button" onClick={() => bulkPatch({ lifecycle: "paid", remainingBalance: 0, agent: "Closed" }, "Selected accounts marked paid.")}>Mark paid</button></div>}
      <div className={`panel accounts-panel density-${density}`}>
        <div className="panel-header sticky-filter">
          <div><h2>{worklist ? "Human calling queue" : "All accounts"}</h2><span className="muted">{filteredRows.length} visible · {meta.total || accounts.length} total</span></div>
          <div className="top-actions account-toolbar">
            <input className="control" placeholder="Search name, loan, campaign" value={query} onChange={event => updateFilter("q", event.target.value)} />
            <select className="control" value={stage} onChange={event => updateFilter("stage", event.target.value)}><option value="all">All stages</option>{[1,2,3,4,5,6].map(item => <option key={item} value={item}>Stage {item}</option>)}</select>
            <select className="control" value={lifecycle} onChange={event => updateFilter("lifecycle", event.target.value)}><option value="all">All lifecycle</option>{Object.entries(lifecycleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <select className="control" value={channel} onChange={event => updateFilter("channel", event.target.value)}><option value="all">All channels</option>{channels.map(item => <option key={item}>{item}</option>)}</select>
            <select className="control" value={agent} onChange={event => updateFilter("agent", event.target.value)}><option value="all">All agents</option>{agents.map(item => <option key={item}>{item}</option>)}</select>
            <select className="control" value={density} onChange={event => updateFilter("density", event.target.value)}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select>
            <button type="button" className="ghost" onClick={resetFilters}>Reset</button>
            <button type="button" className="primary" onClick={exportCsv} disabled={filteredRows.length === 0}>Export</button>
          </div>
        </div>
        {chips.length > 0 && <div className="filter-chips">{chips.map(([label, value, clear]) => <button type="button" key={label} onClick={clear}>{label}: {value} ×</button>)}<button type="button" onClick={resetFilters}>Clear all</button></div>}
        <div className="table-wrap">
          <table aria-label="Accounts table">
            <thead><tr><th><input aria-label="Select visible rows" type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} /></th><th>Customer</th><th>Company</th><th>Campaign</th><th className="numeric">EMI</th><th className="numeric">Remaining</th><th>Due</th><th>Day</th><th>Stage</th><th>Lifecycle</th><th>Last touch</th><th>Agent</th>{worklist && <th>Action</th>}</tr></thead>
            <tbody>
              {loading && <tr><td colSpan={worklist ? "13" : "12"}>Loading accounts...</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={worklist ? "13" : "12"}>No accounts match these filters. Clear filters to return to the full queue.</td></tr>}
              {rows.map(a => <tr key={a.id} className={`clickable-row queue-${zoneClass(a)}`} tabIndex="0" onClick={() => navigate(`/accounts/${a.id}`)} onKeyDown={event => { if (event.key === "Enter") navigate(`/accounts/${a.id}`); if (event.key === " ") toggleRow(event, a.id); }}>
                <td><input aria-label={`Select ${a.name}`} type="checkbox" checked={selected.includes(a.id)} onClick={event => event.stopPropagation()} onChange={event => toggleRow(event, a.id)} /></td>
                <td><strong>{a.name}</strong><div className="muted">{maskMobile(a.mobile)} · {a.id}</div></td><td>{a.client}</td><td>{a.campaign}</td><td className="numeric">{money(a.emiAmount || a.amount)}</td><td className="numeric">{money(a.remainingBalance ?? a.amount)}</td><td>{a.due}</td><td><DayOffsetChip offset={a.offset} label={dayOffsetLabel(a.offset)} /></td><td><StageTrack stage={a.stage} max={6} /></td><td><LifecyclePill lifecycle={a.lifecycle} labels={lifecycleLabels} /></td><td><ChannelBadge channel={a.channel} status={a.lifecycle} /></td><td>{a.agent}</td>
                {worklist && <td><div className="row-actions"><button type="button" className="ghost mini" onClick={event => startCall(event, a)}>Call</button><button type="button" className="primary mini" onClick={event => markPaid(event, a)}>Paid</button></div></td>}
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="pagination-bar"><span>Showing {rows.length ? ((page - 1) * perPage) + 1 : 0}-{Math.min(page * perPage, filteredRows.length)} of {filteredRows.length}</span><div><button className="ghost mini" type="button" disabled={page === 1} onClick={() => updatePage(Math.max(1, page - 1))}>Prev</button><span className="page-count">Page {page} / {totalPages}</span><button className="ghost mini" type="button" disabled={page === totalPages} onClick={() => updatePage(Math.min(totalPages, page + 1))}>Next</button><select className="control" value={perPage} onChange={event => updatePerPage(Number(event.target.value))}>{pageSizes.map(size => <option key={size} value={size}>{size} per page</option>)}</select></div></div>
      </div>
    </>
  );
}
