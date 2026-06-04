import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldCheck, Siren, TicketCheck } from "lucide-react";

import { getAlerts } from "../api/client";
import { AlertTable } from "../components/AlertTable";
import { StatCard } from "../components/StatCard";
import type { AlertCollection, AlertStatus, Severity } from "../types";

const severityOrder: Severity[] = ["Critical", "High", "Medium", "Low"];
const statusOrder: AlertStatus[] = ["New", "In Progress", "Triaged", "Closed"];

export function Dashboard() {
  const [data, setData] = useState<AlertCollection>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    getAlerts()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load alerts"));
  }, []);

  const topAlert = useMemo(() => data?.alerts[0], [data]);
  const statusCounts = useMemo(() => {
    const counts = statusOrder.reduce(
      (accumulator, status) => ({ ...accumulator, [status]: 0 }),
      {} as Record<AlertStatus, number>,
    );

    data?.alerts.forEach((alert) => {
      counts[alert.status] += 1;
    });

    return counts;
  }, [data]);
  const openAlertCount = data
    ? data.alerts.filter((alert) => alert.status !== "Closed").length
    : "--";
  const closedAlertCount = data ? statusCounts.Closed : "--";
  const maxSeverityCount = data
    ? Math.max(...severityOrder.map((severity) => data.severity_counts[severity]), 1)
    : 1;
  const maxStatusCount = Math.max(...statusOrder.map((status) => statusCounts[status]), 1);

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Microsoft Sentinel style workspace</p>
          <h1>AI SOC Analyst dashboard</h1>
          <span>
            Prioritize high-confidence threats, generate hunts, and capture analyst verdicts from a single queue.
          </span>
        </div>
        <div className="hero-card">
          <span>Highest risk</span>
          <strong>{topAlert?.risk_score ?? "--"}</strong>
          <p>{topAlert?.title ?? "Loading alert queue..."}</p>
        </div>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="stats-grid">
        <StatCard
          label="Total alerts"
          value={data?.total ?? "--"}
          helper="Environment alert volume"
          icon={<ShieldCheck size={22} />}
        />
        <StatCard
          label="Critical alerts"
          value={data?.severity_counts.Critical ?? "--"}
          helper="Immediate escalation"
          icon={<Siren size={22} />}
          tone="critical"
        />
        <StatCard
          label="Open alerts"
          value={openAlertCount}
          helper="New, in progress, or triaged"
          icon={<TicketCheck size={22} />}
          tone="medium"
        />
        <StatCard
          label="Closed alerts"
          value={closedAlertCount}
          helper="Completed dispositions"
          icon={<CheckCircle2 size={22} />}
          tone="low"
        />
      </section>

      {data && (
        <section className="dashboard-charts">
          <div className="panel metric-chart-panel">
            <div className="panel-header">
              <div>
                <p>Alerts by severity</p>
                <h2>Risk distribution</h2>
              </div>
              <span>{data.total} total</span>
            </div>
            <div className="metric-bars">
              {severityOrder.map((severity) => {
                const count = data.severity_counts[severity];
                return (
                  <div className="metric-bar-row" key={severity}>
                    <div>
                      <strong>{severity}</strong>
                      <span>{count}</span>
                    </div>
                    <div className="metric-bar-track">
                      <span
                        className={`metric-bar-fill metric-bar-${severity.toLowerCase()}`}
                        style={{ width: `${(count / maxSeverityCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel metric-chart-panel">
            <div className="panel-header">
              <div>
                <p>Alerts by status</p>
                <h2>Workflow distribution</h2>
              </div>
              <span>{openAlertCount} open</span>
            </div>
            <div className="metric-bars">
              {statusOrder.map((status) => {
                const count = statusCounts[status];
                return (
                  <div className="metric-bar-row" key={status}>
                    <div>
                      <strong>{status}</strong>
                      <span>{count}</span>
                    </div>
                    <div className="metric-bar-track">
                      <span
                        className="metric-bar-fill metric-bar-status"
                        style={{ width: `${(count / maxStatusCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {data ? <AlertTable alerts={data.alerts} /> : <div className="panel skeleton">Loading alerts...</div>}
    </main>
  );
}
