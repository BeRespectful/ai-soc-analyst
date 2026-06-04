import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getAiAnalysis, getAlert } from "../api/client";
import { AiAnalysisPanel } from "../components/AiAnalysisPanel";
import { AlertStatusSelect } from "../components/AlertStatusSelect";
import { MITREPanel } from "../components/MITREPanel";
import { SeverityBadge } from "../components/SeverityBadge";
import { VerdictPanel } from "../components/VerdictPanel";
import type { AiAnalysis, Alert } from "../types";

export function AlertDetails() {
  const { alertId = "" } = useParams();
  const [alert, setAlert] = useState<Alert>();
  const [analysis, setAnalysis] = useState<AiAnalysis>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!alertId) {
      return;
    }

    Promise.all([getAlert(alertId), getAiAnalysis(alertId)])
      .then(([alertPayload, analysisPayload]) => {
        setAlert(alertPayload);
        setAnalysis(analysisPayload);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load alert"));
  }, [alertId]);

  if (error) {
    return <main className="page"><div className="error-banner">{error}</div></main>;
  }

  if (!alert) {
    return <main className="page"><div className="panel skeleton">Loading alert details...</div></main>;
  }

  return (
    <main className="page detail-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <section className="detail-hero">
        <div>
          <SeverityBadge severity={alert.severity} />
          <h1>{alert.title}</h1>
          <p>{alert.description}</p>
        </div>
        <Link to={`/investigation/${alert.id}`} className="primary-link">
          Open investigation
          <ExternalLink size={16} />
        </Link>
      </section>

      <section className="detail-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p>Alert metadata</p>
              <h2>{alert.id}</h2>
            </div>
            <AlertStatusSelect
              alertId={alert.id}
              status={alert.status}
              onStatusChange={setAlert}
            />
          </div>
          <dl className="metadata-list">
            <div><dt>Source</dt><dd>{alert.source}</dd></div>
            <div><dt>Entity</dt><dd>{alert.entity}</dd></div>
            <div><dt>MITRE</dt><dd>{alert.mitre_id} / {alert.technique}</dd></div>
            <div><dt>Tactic</dt><dd>{alert.tactic}</dd></div>
            <div><dt>Risk score</dt><dd>{alert.risk_score}</dd></div>
            <div><dt>Confidence</dt><dd>{alert.confidence}%</dd></div>
          </dl>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p>Evidence</p>
              <h2>Correlated signals</h2>
            </div>
          </div>
          <ul className="signal-list">
            {alert.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <MITREPanel alert={alert} />
      <AiAnalysisPanel analysis={analysis} loading={!analysis} />
      <VerdictPanel alertId={alert.id} />
    </main>
  );
}
