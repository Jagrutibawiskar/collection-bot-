import { useMemo, useRef, useState } from "react";
import { Topbar, Kpi } from "./ui.jsx";

const wizardSteps = [
  { label: "Upload", note: "CSV/XLSX" },
  { label: "Map columns", note: "Auto-matched" },
  { label: "Validate", note: "Preview issues" },
  { label: "Confirm", note: "Start campaigns" }
];

const fieldOptions = [
  "customer_id",
  "customer_name",
  "mobile",
  "email",
  "outstanding_amount",
  "due_date",
  "invoice_number",
  "client_name",
  "payment_link",
  "ignore"
];

const defaultMappings = [
  ["Acct Ref", "customer_id"],
  ["Cust Name", "customer_name"],
  ["Mobile", "mobile"],
  ["Balance", "outstanding_amount"],
  ["Pay By", "due_date"],
  ["Notes", "ignore"]
];

const validationRows = [
  { row: 18, field: "mobile", value: "07700 900123", reason: "Missing country code" },
  { row: 42, field: "due_date", value: "31/02/2026", reason: "Invalid date" },
  { row: 76, field: "outstanding_amount", value: "TBD", reason: "Amount must be numeric" }
];

export default function Import() {
  const inputRef = useRef(null);
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [mappings, setMappings] = useState(defaultMappings);
  const [startCampaigns, setStartCampaigns] = useState(true);
  const [duplicatePolicy, setDuplicatePolicy] = useState("update");
  const [complete, setComplete] = useState(false);

  const selectedName = file?.name || "acme-august-ledger.csv";
  const readyRows = file ? 4182 : 1200;
  const badRows = file ? 61 : 18;
  const contactToday = file ? 1204 : 340;

  const mappedRequired = useMemo(() => {
    const values = new Set(mappings.map(([, to]) => to));
    return ["customer_id", "customer_name", "mobile", "outstanding_amount", "due_date"].every(field => values.has(field));
  }, [mappings]);

  function pickFile(event) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    setFile(nextFile);
    setComplete(false);
    setStep(1);
  }

  function updateMapping(index, value) {
    setMappings(prev => prev.map((row, i) => i === index ? [row[0], value] : row));
  }

  function nextStep() {
    if (step === 3) {
      setComplete(true);
      return;
    }
    setStep(prev => Math.min(prev + 1, 3));
  }

  function previousStep() {
    setStep(prev => Math.max(prev - 1, 0));
  }

  return (
    <>
      <Topbar title="Import Accounts" subtitle="Four-step ledger wizard with mapping, validation and safe campaign start." />
      <div className="panel">
        <div className="panel-body">
          <div className="wizard-steps">
            {wizardSteps.map((wizardStep, i) => (
              <button
                key={wizardStep.label}
                type="button"
                className={`wizard-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
                onClick={() => setStep(i)}
              >
                <strong>{i + 1}. {wizardStep.label}</strong>
                <div className="muted">{wizardStep.note}</div>
              </button>
            ))}
          </div>

          {step === 0 && (
            <div className="grid dashboard-grid">
              <label className="dropzone">
                <input ref={inputRef} type="file" accept=".csv,.xlsx" onChange={pickFile} hidden />
                <div>
                  <strong>{file ? selectedName : "Drag a CSV or XLSX here"}</strong>
                  <p className="muted">Max 50 MB / 100,000 rows. Demo mode also works without a file.</p>
                  <button type="button" className="primary" onClick={() => inputRef.current?.click()}>Browse file</button>
                </div>
              </label>
              <div className="import-summary-card">
                <span className="eyebrow">Upload safety</span>
                <h3>Nothing sends until confirmation.</h3>
                <p>Back-dated ledgers show how many accounts enter each stage before campaigns start.</p>
                <button type="button" className="ghost" onClick={() => setStep(1)}>Use demo file</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid dashboard-grid">
              <div>
                <h3 className="section-title">Column mapping</h3>
                {mappings.map(([from, to], index) => (
                  <div key={from} className="mapping-row">
                    <strong>{from}</strong>
                    <select className="control" value={to} onChange={event => updateMapping(index, event.target.value)}>
                      {fieldOptions.map(option => <option key={option}>{option}</option>)}
                    </select>
                    <span>{to === "ignore" ? "○" : "✓"}</span>
                  </div>
                ))}
              </div>
              <div className={`auth-alert ${mappedRequired ? "ok" : "error"}`}>
                {mappedRequired
                  ? "Required fields are mapped. You can continue to validation."
                  : "Map customer_id, customer_name, mobile, outstanding_amount and due_date before importing."}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="import-result-grid">
                <Kpi label="Rows ready" value={readyRows.toLocaleString()} note="safe to import" />
                <Kpi label="Rows with problems" value={badRows.toLocaleString()} note="editable before commit" />
                <Kpi label="Duplicates" value="12" note="policy required" />
              </div>
              <div className="table-wrap import-issues">
                <table>
                  <thead><tr><th>Row</th><th>Field</th><th>Value</th><th>Issue</th></tr></thead>
                  <tbody>
                    {validationRows.map(row => (
                      <tr key={row.row}>
                        <td>{row.row}</td>
                        <td>{row.field}</td>
                        <td>{row.value}</td>
                        <td>{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="segmented-control">
                <button type="button" className={duplicatePolicy === "update" ? "active" : ""} onClick={() => setDuplicatePolicy("update")}>Update duplicates</button>
                <button type="button" className={duplicatePolicy === "ignore" ? "active" : ""} onClick={() => setDuplicatePolicy("ignore")}>Ignore duplicates</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="confirm-panel">
              <span className="eyebrow">Confirm import</span>
              <h3>Importing {readyRows.toLocaleString()} accounts to Acme Utilities.</h3>
              <p>{contactToday.toLocaleString()} will enter stage 1 today. 380 are already overdue and enter stage 3.</p>
              <label className="checkbox-row">
                <input type="checkbox" checked={startCampaigns} onChange={event => setStartCampaigns(event.target.checked)} />
                Start campaigns immediately
              </label>
              <div className="auth-alert ok">
                Duplicate policy: {duplicatePolicy === "update" ? "update existing accounts" : "ignore existing accounts"}.
              </div>
              {complete && <div className="auth-alert ok">Import job queued successfully. Poll `/api/imports/:id` for progress.</div>}
            </div>
          )}

          <div className="wizard-actions">
            <button type="button" className="ghost" onClick={previousStep} disabled={step === 0}>Back</button>
            <button type="button" className="primary" onClick={nextStep} disabled={step === 1 && !mappedRequired}>
              {step === 3 ? "Import accounts" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
