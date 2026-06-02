import { useState } from "react";
import { Copy, TerminalSquare } from "lucide-react";

import { generateKql } from "../api/client";
import type { KqlQuery } from "../types";

interface KqlPanelProps {
  alertId: string;
}

export function KqlPanel({ alertId }: KqlPanelProps) {
  const [objective, setObjective] = useState("Find related activity for this alert");
  const [query, setQuery] = useState<KqlQuery>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleGenerate() {
    setLoading(true);
    setError(undefined);
    try {
      setQuery(await generateKql(alertId, objective));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate KQL");
    } finally {
      setLoading(false);
    }
  }

  async function copyQuery() {
    if (query) {
      await navigator.clipboard.writeText(query.query);
    }
  }

  return (
    <section className="panel kql-panel">
      <div className="panel-header">
        <div>
          <p>KQL query generation</p>
          <h2>Threat hunting prompt</h2>
        </div>
        <TerminalSquare size={24} />
      </div>

      <label className="field">
        Hunt objective
        <textarea
          value={objective}
          onChange={(event) => setObjective(event.target.value)}
          rows={3}
        />
      </label>

      <button className="primary-button" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate KQL"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {query && (
        <div className="query-result">
          <div>
            <h3>{query.title}</h3>
            <p>{query.description}</p>
          </div>
          <button className="ghost-button" onClick={copyQuery}>
            <Copy size={16} />
            Copy
          </button>
          <pre>{query.query}</pre>
        </div>
      )}
    </section>
  );
}
