import { useMemo, useState } from "react";
import { ClipboardCopy, FileText } from "lucide-react";

import type { Alert, Investigation } from "../types";

interface IncidentReportPanelProps {
  alert: Alert;
  investigation: Investigation;
}

interface IncidentReport {
  generatedAt: string;
  kql: string;
  sections: Array<{
    title: string;
    body?: string;
    items?: string[];
  }>;
  plainText: string;
}

function escapeKqlLiteral(value: string): string {
  return value.replaceAll("'", "\\'");
}

function buildGeneratedKql(alert: Alert): string {
  const entity = escapeKqlLiteral(alert.entity);
  const title = escapeKqlLiteral(alert.title);
  const technique = escapeKqlLiteral(alert.technique);
  const mitreId = escapeKqlLiteral(alert.mitre_id);

  return `let alertEntity = '${entity}';
let lookback = 24h;
SecurityAlert
| where TimeGenerated > ago(lookback)
| where AlertName has_any ('${title}', '${technique}', '${mitreId}')
| union isfuzzy=true (
    SigninLogs
    | where TimeGenerated > ago(lookback)
    | where UserPrincipalName =~ alertEntity or IPAddress has_any ('203.0.113.84', '198.51.100.18')
    | project TimeGenerated, SourceSystem='SigninLogs', UserPrincipalName, IPAddress, AppDisplayName, ResultType
), (
    DeviceProcessEvents
    | where TimeGenerated > ago(lookback)
    | where DeviceName =~ alertEntity or AccountName =~ alertEntity or ProcessCommandLine has_any ('EncodedCommand', 'vssadmin', 'New-InboxRule')
    | project TimeGenerated, SourceSystem='DeviceProcessEvents', DeviceName, AccountName, FileName, ProcessCommandLine
)
| order by TimeGenerated desc`;
}

function buildAiSummary(alert: Alert): string {
  return (
    `${alert.title} is a ${alert.severity.toLowerCase()} severity alert with a ` +
    `${alert.risk_score}/100 risk score and ${alert.confidence}% confidence. ` +
    `The activity maps to ${alert.technique} (${alert.mitre_id}) in the ` +
    `${alert.tactic} tactic and centers on ${alert.entity}.`
  );
}

function buildReport(alert: Alert, investigation: Investigation): IncidentReport {
  const generatedAt = new Date().toISOString();
  const kql = buildGeneratedKql(alert);
  const sections = [
    {
      title: "Alert overview",
      body: [
        `Alert title: ${alert.title}`,
        `Severity: ${alert.severity}`,
        `Entity/user: ${alert.entity}`,
        `Source: ${alert.source}`,
        `Alert timestamp: ${alert.timestamp}`,
        `Report generated: ${generatedAt}`,
      ].join("\n"),
    },
    {
      title: "MITRE ATT&CK mapping",
      body: `Technique: ${alert.mitre_id} - ${alert.technique}\nTactic: ${alert.tactic}`,
    },
    {
      title: "AI summary",
      body: buildAiSummary(alert),
    },
    {
      title: "Generated KQL",
      body: kql,
    },
    {
      title: "Analyst notes",
      body: "No analyst notes recorded in this version.",
    },
    {
      title: "Verdict/status",
      body: `Status: ${alert.status}\nVerdict: Pending analyst disposition`,
    },
    {
      title: "Investigation timeline",
      items: investigation.timeline.map((event) => `${event.time}: ${event.activity} - ${event.signal}`),
    },
    {
      title: "Recommended actions",
      items: alert.recommended_actions,
    },
  ];
  const plainText = [
    "Incident Report",
    "===============",
    "",
    ...sections.flatMap((section) => [
      section.title,
      "-".repeat(section.title.length),
      section.body ?? section.items?.map((item) => `- ${item}`).join("\n") ?? "",
      "",
    ]),
  ].join("\n");

  return { generatedAt, kql, sections, plainText };
}

export function IncidentReportPanel({ alert, investigation }: IncidentReportPanelProps) {
  const [report, setReport] = useState<IncidentReport>();
  const [copyStatus, setCopyStatus] = useState<string>();
  const previewReport = useMemo(() => report, [report]);

  function handleGenerate() {
    setReport(buildReport(alert, investigation));
    setCopyStatus(undefined);
  }

  async function handleCopy() {
    if (!report) {
      return;
    }

    await navigator.clipboard.writeText(report.plainText);
    setCopyStatus("Report copied");
  }

  return (
    <section className="panel incident-report-panel">
      <div className="panel-header">
        <div>
          <p>Incident report generator</p>
          <h2>Professional investigation report</h2>
        </div>
        <FileText size={24} />
      </div>

      <p className="report-intro">
        Generate a structured incident report from the current alert, investigation timeline, MITRE mapping, KQL hunt,
        status, and recommended response actions.
      </p>

      <div className="report-actions">
        <button className="primary-button" onClick={handleGenerate}>
          Generate Report
        </button>
        <button className="ghost-button" onClick={handleCopy} disabled={!report}>
          <ClipboardCopy size={16} />
          Copy Report
        </button>
        {copyStatus && <span className="success-text">{copyStatus}</span>}
      </div>

      {previewReport && (
        <div className="incident-report-output">
          <div className="report-title-row">
            <div>
              <span>Generated report</span>
              <h3>{alert.title}</h3>
            </div>
            <strong>{alert.severity}</strong>
          </div>

          {previewReport.sections.map((section) => (
            <article key={section.title} className="report-section">
              <h4>{section.title}</h4>
              {section.body && <pre>{section.body}</pre>}
              {section.items && (
                <ul className="signal-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
