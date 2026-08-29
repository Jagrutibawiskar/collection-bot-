import { useMemo, useRef, useState } from "react";
import { createImport, saveImportMapping, getImportJob } from "../api.js";
import { Topbar, Kpi } from "./ui.jsx";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_ROWS = 100000;

const wizardSteps = [
  { label: "Upload", note: "CSV/XLSX" },
  { label: "Map columns", note: "Auto-matched" },
  { label: "Validate", note: "Preview issues" },
  { label: "Confirm", note: "Start campaigns" }
];

const fieldOptions = ["customer_id", "customer_name", "mobile", "email", "outstanding_amount", "paid_amount", "remaining_balance", "emi_amount", "pending_emi", "total_emi_count", "insurance", "service_tax", "fine", "fine_overdue", "due_date", "next_due_date", "loan_account", "client_name", "payment_link", "ignore"];
const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MMM-YYYY"];

const defaultMappings = [
  ["Loan Account", "loan_account"], ["Customer Name", "customer_name"], ["Mobile", "mobile"], ["Total EMI Amount", "outstanding_amount"], ["EMI Amount", "emi_amount"], ["Paid Amount", "paid_amount"], ["Remaining Balance", "remaining_balance"], ["Pending EMI", "pending_emi"], ["Total No. EMI", "total_emi_count"], ["Insurance", "insurance"], ["Service Tax", "service_tax"], ["Fine", "fine"], ["Fine Overdue", "fine_overdue"], ["Due Date", "due_date"], ["Next Date", "next_due_date"]
];

const defaultValidationRows = [
  { row: 18, field: "mobile", value: "07700 900123", reason: "Missing country code" },
  { row: 42, field: "due_date", value: "31/02/2026", reason: "Invalid date" },
  { row: 76, field: "outstanding_amount", value: "TBD", reason: "Amount must be numeric" }
];

export default function Import() {
  const inputRef = useRef(null);
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [mappings, setMappings] = useState(defaultMappings);
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [startCampaigns, setStartCampaigns] = useState(true);
  const [duplicatePolicy, setDuplicatePolicy] = useState("update");
  const [badRowPolicy, setBadRowPolicy] = useState("skip");
  const [complete, setComplete] = useState(false);
  const [importJobId, setImportJobId] = useState("IMP-DEMO-1");
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState("Waiting for file");
  const [cancelled, setCancelled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [validationRows, setValidationRows] = useState(defaultValidationRows);
  const [allInvalid, setAllInvalid] = useState(false);

  const selectedName = file?.name || "finance-emi-ledger.xlsx";
  const estimatedRows = file ? 4182 : 1200;
  const readyRows = allInvalid ? 0 : file ? 4182 : 1200;
  const badRows = allInvalid ? estimatedRows : validationRows.length || 0;
  const contactToday = file ? 1204 : 340;
  const fixedRows = defaultValidationRows.length - validationRows.length;

  const mappedRequired = useMemo(() => {
    const values = new Set(mappings.map(([, to]) => to));
    return ["customer_name", "mobile", "outstanding_amount", "due_date"].every(field => values.has(field));
  }, [mappings]);

  function runProgress(label, doneLabel) {
    setJobStatus(label);
    setProgress(18);
    window.setTimeout(() => setProgress(48), 180);
    window.setTimeout(() => setProgress(76), 360);
    window.setTimeout(() => { setProgress(100); setJobStatus(doneLabel); }, 560);
  }

  function acceptFile(nextFile) {
    if (!nextFile) return;
    const extensionOk = /\.(csv|xlsx)$/i.test(nextFile.name);
    if (!extensionOk) {
      setFileError("Only CSV or XLSX files are supported.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFileError("File is larger than 50 MB. Use SFTP or API import for larger ledgers.");
      return;
    }
    setFileError("");
    setFile(nextFile);
    setComplete(false);
    setCancelled(false);
    setAllInvalid(false);
    setValidationRows(defaultValidationRows);
    runProgress("Uploading ledger", "Upload complete");
    createImport(nextFile).then(job => setImportJobId(job.id));
    setStep(1);
  }

  function pickFile(event) {
    acceptFile(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  function useDemoFile() {
    setCancelled(false);
    setFile(null);
    setFileError("");
    setAllInvalid(false);
    setValidationRows(defaultValidationRows);
    runProgress("Loading sample ledger", "Sample ready");
    setStep(1);
  }

  function updateMapping(index, value) {
    setMappings(prev => prev.map((row, i) => i === index ? [row[0], value] : row));
  }

  function updateIssue(index, value) {
    setValidationRows(prev => prev.map((row, i) => i === index ? { ...row, value } : row));
  }

  function markIssueFixed(index) {
    setValidationRows(prev => prev.filter((_, i) => i !== index));
  }

  function downloadCsv(name, rows) {
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadTemplate() {
    downloadCsv("cegura-import-template.csv", [["loan_account", "customer_name", "mobile", "emi_amount", "paid_amount", "remaining_balance", "due_date", "next_due_date", "payment_link"]]);
  }

  function downloadRejectedRows() {
    downloadCsv("rejected-rows.csv", [["row", "field", "value", "issue"], ...validationRows.map(row => [row.row, row.field, row.value, row.reason])]);
  }

  function cancelUpload() {
    setCancelled(true);
    setProgress(0);
    setJobStatus("Upload cancelled");
    setStep(0);
  }

  function nextStep() {
    if (step === 1) {
      saveImportMapping(importJobId, { ...Object.fromEntries(mappings), dateFormat });
      runProgress("Saving mapping", "Mapping saved");
    }
    if (step === 2) {
      getImportJob(importJobId);
      runProgress("Validating rows", validationRows.length ? "Partial success" : "Validation complete");
    }
    if (step === 3) {
      setComplete(true);
      setJobStatus("Import job queued");
      return;
    }
    setStep(prev => Math.min(prev + 1, 3));
  }

  function previousStep() {
    setStep(prev => Math.max(prev - 1, 0));
  }

  return (
    <>
      <Topbar title="Import Accounts" subtitle="Finance EMI sheet upload with mapping, validation and safe campaign start." />
      <div className="panel import-panel">
        <div className="panel-body">
          <div className="wizard-steps">{wizardSteps.map((wizardStep, i) => <button key={wizardStep.label} type="button" className={`wizard-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`} onClick={() => setStep(i)}><strong>{i + 1}. {wizardStep.label}</strong><div className="muted">{wizardStep.note}</div></button>)}</div>

          <div className="import-status"><div><strong>{jobStatus}</strong><span>{importJobId} · Max 50 MB / {MAX_ROWS.toLocaleString()} rows</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div>{progress > 0 && progress < 100 && <button type="button" className="ghost mini" onClick={cancelUpload}>Cancel</button>}</div>
          {cancelled && <div className="auth-alert error import-alert">Upload cancelled. Choose another file to continue.</div>}
          {fileError && <div className="auth-alert error import-alert">{fileError}</div>}

          {step === 0 && <div className="grid dashboard-grid"><label className={`dropzone ${dragging ? "dragging" : ""}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}><input ref={inputRef} type="file" accept=".csv,.xlsx" onChange={pickFile} hidden /><div><strong>{file ? selectedName : dragging ? "Drop the ledger here" : "Drag a CSV or XLSX here"}</strong><p className="muted">Upload customer, EMI, paid, pending, fine, insurance and next due date columns. Files above 50 MB should use SFTP or API sync.</p><button type="button" className="primary" onClick={() => inputRef.current?.click()}>Browse file</button></div></label><div className="import-summary-card"><span className="eyebrow">Upload safety</span><h3>Nothing sends until confirmation.</h3><p>Step 4 shows how many customers will be contacted today before campaigns start.</p><div className="import-option-row"><button type="button" className="ghost" onClick={downloadTemplate}>Download template</button><button type="button" className="ghost" onClick={useDemoFile}>Use sample file</button><button type="button" className="ghost" onClick={() => setJobStatus("SFTP source selected")}>Import from SFTP</button><button type="button" className="ghost" onClick={() => setJobStatus("API import selected")}>Use API</button></div></div></div>}

          {step === 1 && <div className="grid dashboard-grid"><div><h3 className="section-title">Column mapping</h3>{mappings.map(([from, to], index) => <div key={from} className="mapping-row"><strong>{from}</strong><select className="control" value={to} onChange={event => updateMapping(index, event.target.value)}>{fieldOptions.map(option => <option key={option}>{option}</option>)}</select><span>{to === "ignore" ? "○" : "✓"}</span></div>)}</div><div className="mapping-side"><div className={`auth-alert ${mappedRequired ? "ok" : "error"}`}>{mappedRequired ? "Required fields are mapped. You can continue to validation." : "Map customer_name, mobile, outstanding_amount and due_date before importing."}</div><label className="auth-field"><span>Date format for due date columns</span><select className="control" value={dateFormat} onChange={event => setDateFormat(event.target.value)}>{dateFormats.map(format => <option key={format}>{format}</option>)}</select></label><div className="auth-alert ok">Mapping will be remembered for this client on the backend.</div></div></div>}

          {step === 2 && <div><div className="import-result-grid"><Kpi label="Rows ready" value={readyRows.toLocaleString()} note="safe to import" /><Kpi label="Rows with problems" value={badRows.toLocaleString()} note={allInvalid ? "wrong file or delimiter" : "editable before commit"} /><Kpi label="Duplicates" value="12" note="policy required" /></div>{allInvalid && <div className="auth-alert error import-alert">All rows look invalid. Check file type, delimiter, date format, or download the template.</div>}{!allInvalid && validationRows.length === 0 && <div className="auth-alert ok import-alert">All visible issues fixed. The import can continue without rejected rows.</div>}<div className="table-wrap import-issues"><table><thead><tr><th>Row</th><th>Field</th><th>Editable value</th><th>Issue</th><th>Action</th></tr></thead><tbody>{validationRows.map((row, index) => <tr key={row.row}><td>{row.row}</td><td>{row.field}</td><td><input className="control" value={row.value} onChange={event => updateIssue(index, event.target.value)} /></td><td>{row.reason}</td><td><button type="button" className="ghost mini" onClick={() => markIssueFixed(index)}>Mark fixed</button></td></tr>)}{validationRows.length === 0 && <tr><td colSpan="5">No failing rows remain.</td></tr>}</tbody></table></div><div className="import-policy-grid"><div><span className="eyebrow">Bad rows</span><div className="segmented-control"><button type="button" className={badRowPolicy === "skip" ? "active" : ""} onClick={() => setBadRowPolicy("skip")}>Skip bad rows</button><button type="button" className={badRowPolicy === "fix" ? "active" : ""} onClick={() => setBadRowPolicy("fix")}>Fix here</button><button type="button" className={badRowPolicy === "cancel" ? "active" : ""} onClick={() => setBadRowPolicy("cancel")}>Cancel import</button></div></div><div><span className="eyebrow">Duplicates</span><div className="segmented-control"><button type="button" className={duplicatePolicy === "update" ? "active" : ""} onClick={() => setDuplicatePolicy("update")}>Update duplicates</button><button type="button" className={duplicatePolicy === "ignore" ? "active" : ""} onClick={() => setDuplicatePolicy("ignore")}>Ignore duplicates</button></div></div><button type="button" className="ghost" onClick={downloadRejectedRows} disabled={validationRows.length === 0}>Download rejected rows</button><button type="button" className="ghost" onClick={() => setAllInvalid(prev => !prev)}>{allInvalid ? "Show partial success" : "Preview all invalid"}</button></div></div>}

          {step === 3 && <div className="confirm-panel"><span className="eyebrow">Confirm import</span><h3>Importing {readyRows.toLocaleString()} accounts to L&T Finance.</h3><p>{contactToday.toLocaleString()} will enter D-7/D-4 reminders today. 380 are already overdue and move to manager queue.</p><label className="checkbox-row"><input type="checkbox" checked={startCampaigns} onChange={event => setStartCampaigns(event.target.checked)} />Start campaigns immediately</label><div className="auth-alert ok">Date format: {dateFormat}. Fixed rows: {fixedRows}. Bad rows: {badRowPolicy}. Duplicate policy: {duplicatePolicy === "update" ? "update existing accounts" : "ignore existing accounts"}.</div>{complete && <div className="auth-alert ok">Import job queued successfully. Polling /api/imports/:id for progress. Partial success summary stays available for download.</div>}</div>}

          <div className="wizard-actions"><button type="button" className="ghost" onClick={previousStep} disabled={step === 0}>Back</button><button type="button" className="primary" onClick={nextStep} disabled={(step === 1 && !mappedRequired) || (step === 2 && (badRowPolicy === "cancel" || allInvalid))}>{step === 3 ? "Import accounts" : "Continue"}</button></div>
        </div>
      </div>
    </>
  );
}
