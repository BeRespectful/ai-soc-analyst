import { useState } from "react";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";

import { submitVerdict } from "../api/client";
import type { Verdict, VerdictResponse } from "../types";

const verdicts: Array<{ value: Verdict; helper: string; icon: typeof CheckCircle2 }> = [
  {
    value: "True Positive",
    helper: "Confirmed malicious or policy-impacting activity.",
    icon: CheckCircle2,
  },
  {
    value: "False Positive",
    helper: "Benign activity or analytics tuning candidate.",
    icon: XCircle,
  },
  {
    value: "Suspicious",
    helper: "Needs more enrichment before closure.",
    icon: HelpCircle,
  },
];

interface VerdictPanelProps {
  alertId: string;
}

export function VerdictPanel({ alertId }: VerdictPanelProps) {
  const [selectedVerdict, setSelectedVerdict] = useState<Verdict>("Suspicious");
  const [notes, setNotes] = useState("");
  const [response, setResponse] = useState<VerdictResponse>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      setResponse(await submitVerdict(alertId, selectedVerdict, notes));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel verdict-panel">
      <div className="panel-header">
        <div>
          <p>Verdict panel</p>
          <h2>Analyst disposition</h2>
        </div>
        <span className="status-pill">Required</span>
      </div>

      <div className="verdict-grid">
        {verdicts.map((verdict) => {
          const Icon = verdict.icon;
          return (
            <button
              key={verdict.value}
              className={selectedVerdict === verdict.value ? "verdict-option active" : "verdict-option"}
              onClick={() => setSelectedVerdict(verdict.value)}
            >
              <Icon size={20} />
              <strong>{verdict.value}</strong>
              <span>{verdict.helper}</span>
            </button>
          );
        })}
      </div>

      <label className="field">
        Analyst notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Document why this verdict was selected."
          rows={4}
        />
      </label>

      <button className="primary-button" onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit verdict"}
      </button>

      {response && (
        <div className="verdict-response">
          <strong>{response.disposition}</strong>
          <ul>
            {response.next_actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
