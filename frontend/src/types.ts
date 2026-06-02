export type Severity = "Low" | "Medium" | "High" | "Critical";
export type AlertStatus = "New" | "In Progress" | "Triaged" | "Closed";
export type Verdict = "True Positive" | "False Positive" | "Suspicious";

export interface AlertSummary {
  id: string;
  title: string;
  severity: Severity;
  status: AlertStatus;
  source: string;
  entity: string;
  timestamp: string;
  tactic: string;
  risk_score: number;
}

export interface Alert extends AlertSummary {
  technique: string;
  mitre_id: string;
  description: string;
  evidence: string[];
  affected_assets: string[];
  recommended_actions: string[];
  confidence: number;
}

export interface AlertCollection {
  alerts: AlertSummary[];
  total: number;
  severity_counts: Record<Severity, number>;
}

export interface TimelineEvent {
  time: string;
  activity: string;
  signal: string;
}

export interface Investigation {
  alert_id: string;
  timeline: TimelineEvent[];
  entities: string[];
  playbook_steps: string[];
  related_queries: string[];
}

export interface AiAnalysis {
  alert_id: string;
  executive_summary: string;
  likely_attack_path: string[];
  hypothesis: string;
  recommended_next_steps: string[];
  confidence: number;
}

export interface KqlQuery {
  title: string;
  description: string;
  query: string;
}

export interface VerdictResponse {
  alert_id: string;
  verdict: Verdict;
  disposition: string;
  next_actions: string[];
}
