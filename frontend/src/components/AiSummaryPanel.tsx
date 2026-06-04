import { BrainCircuit, ShieldAlert, Sparkles } from "lucide-react";

import type { Alert } from "../types";

interface AiSummaryPanelProps {
  alert: Alert;
}

function buildLikelyBehavior(alert: Alert): string {
  return (
    `Activity aligns with ${alert.technique} (${alert.mitre_id}) in the ` +
    `${alert.tactic} tactic. The likely behavior is use of the primary entity, ` +
    `${alert.entity}, to continue suspicious access or prepare follow-on actions.`
  );
}

function buildSuspiciousReason(alert: Alert): string {
  return (
    `The alert combines ${alert.source} telemetry with ${alert.evidence.length} ` +
    `correlated evidence items, including ${alert.evidence[0].toLowerCase()}.`
  );
}

export function AiSummaryPanel({ alert }: AiSummaryPanelProps) {
  return (
    <section className="panel ai-summary-panel">
      <div className="panel-header">
        <div>
          <p>AI alert summary</p>
          <h2>What happened and what to do next</h2>
        </div>
        <BrainCircuit size={24} />
      </div>

      <div className="ai-summary-hero">
        <Sparkles size={18} />
        <p>
          {alert.title} is a {alert.severity.toLowerCase()} severity alert with a{" "}
          {alert.risk_score}/100 risk score and {alert.confidence}% confidence.
        </p>
      </div>

      <div className="ai-summary-grid">
        <div>
          <span>What happened</span>
          <p>{alert.description}</p>
        </div>
        <div>
          <span>Why it is suspicious</span>
          <p>{buildSuspiciousReason(alert)}</p>
        </div>
        <div>
          <span>Likely attacker behavior</span>
          <p>{buildLikelyBehavior(alert)}</p>
        </div>
        <div className="risk-summary-card">
          <span>Risk level</span>
          <strong>{alert.severity}</strong>
          <div className="risk-meter">
            <span style={{ width: `${alert.risk_score}%` }} />
          </div>
          <small>{alert.risk_score}/100 risk score</small>
        </div>
      </div>

      <div className="next-steps-card">
        <div>
          <ShieldAlert size={18} />
          <h3>Recommended next steps</h3>
        </div>
        <ul className="signal-list">
          {alert.recommended_actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
