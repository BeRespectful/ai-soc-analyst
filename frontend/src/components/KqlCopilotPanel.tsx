import { useState } from "react";
import { BrainCircuit, Copy } from "lucide-react";

import { generateKqlCopilot } from "../api/client";
import type { KqlCopilotResponse } from "../types";

interface KqlCopilotPanelProps {
  alertId: string;
}

export function KqlCopilotPanel({ alertId }: KqlCopilotPanelProps) {
  const [investigationRequest, setInvestigationRequest] = useState(
    "Find mailbox forwarding rule changes and suspicious sign-ins for this user",
  );
  const [response, setResponse] = useState<KqlCopilotResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleGenerate() {
    const trimmedRequest = investigationRequest.trim();
    if (trimmedRequest.length < 3) {
      setError("Enter at least 3 characters for the investigation request.");
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      setResponse(await generateKqlCopilot(trimmedRequest, alertId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate Copilot KQL");
    } finally {
      setLoading(false);
    }
  }

  async function copyQuery() {
    if (response) {
      await navigator.clipboard.writeText(response.query);
    }
  }

  return (
    <section className="panel kql-copilot-panel">
      <div className="panel-header">
        <div>
          <p>KQL Copilot</p>
          <h2>Ask for an investigation hunt</h2>
        </div>
        <BrainCircuit size={24} />
      </div>

      <label className="field">
        Natural language investigation request
        <textarea
          value={investigationRequest}
          onChange={(event) => setInvestigationRequest(event.target.value)}
          rows={3}
        />
      </label>

      <button
        className="primary-button"
        onClick={handleGenerate}
        disabled={loading || investigationRequest.trim().length < 3}
      >
        {loading ? "Generating..." : "Generate Copilot KQL"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {response && (
        <div className="copilot-result">
          <div className="copilot-meta">
            <span>Data source</span>
            <strong>{response.data_source}</strong>
          </div>
          <div className="copilot-meta">
            <span>Explanation</span>
            <p>{response.explanation}</p>
          </div>
          <div className="copilot-steps">
            <span>Investigation steps</span>
            <ol>
              {response.investigation_steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <button className="ghost-button" onClick={copyQuery}>
            <Copy size={16} />
            Copy
          </button>
          <pre>{response.query}</pre>
        </div>
      )}
    </section>
  );
}
