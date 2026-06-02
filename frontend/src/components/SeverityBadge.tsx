import type { Severity } from "../types";

const severityClass: Record<Severity, string> = {
  Low: "severity-low",
  Medium: "severity-medium",
  High: "severity-high",
  Critical: "severity-critical",
};

interface SeverityBadgeProps {
  severity: Severity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return <span className={`severity-badge ${severityClass[severity]}`}>{severity}</span>;
}
