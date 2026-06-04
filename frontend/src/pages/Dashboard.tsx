import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldCheck, Siren, TicketCheck } from "lucide-react";

import { getAlerts } from "../api/client";
import { AlertTable } from "../components/AlertTable";
import { StatCard } from "../components/StatCard";
import type { AlertCollection, AlertStatus, Severity } from "../types";

type SeverityFilter = "All" | Severity;
type StatusFilter = "All" | Extract<AlertStatus, "New" | "In Progress" | "Closed">;

const severityFilters: SeverityFilter[] = ["All", "Low", "Medium", "High", "Critical"];
const statusFilters: StatusFilter[] = ["All", "New", "In Progress", "Closed"];
const severityOrder: Severity[] = ["Critical", "High", "Medium", "Low"];
const statusOrder: AlertStatus[] = ["New", "In Progress", "Triaged", "Closed"];

export function Dashboard() {
  const [data, setData] = useState<AlertCollection>();
  const [error, setError] = useState<string>();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

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
  const filteredAlerts = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return data.alerts.filter((alert) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          alert.title,
          alert.entity,
          alert.source,
          alert.tactic,
          alert.status,
          alert.severity,
        ].some((field) => field.toLowerCase().includes(normalizedSearch));
      const matchesSeverity = severityFilter === "All" || alert.severity === severityFilter;
      const matchesStatus = statusFilter === "All" || alert.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [data, searchTerm, severityFilter, statusFilter]);
  const openAlertCount = data
    ? data.alerts.filter((alert) => alert.status !== "Closed").length
    : "--";
  const closedAlertCount = data ? statusCounts.Closed : "--";
  const maxSeverityCount = data
    ? Math.max(...severityOrder.map((severity) => data.severity_counts[severity]), 1)
    : 1;
  const maxStatusCount = Math.max(...statusOrder.map((status) => statusCounts[status]), 1);
  const filtersActive =
    searchTerm.trim().length > 0 || severityFilter !== "All" || statusFilter !== "All";

  function clearFilters() {
    setSearchTerm("");
    setSeverityFilter("All");
    setStatusFilter("All");
  }

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

      {data && (
        <section className="panel dashboard-filters">
          <div className="panel-header">
            <div>
              <p>Alert search</p>
              <h2>Find alerts quickly</h2>
            </div>
            <span>
              Showing {filteredAlerts.length} of {data.total} alerts
            </span>
          </div>

          <div className="filter-grid">
            <label className="field">
              Search alerts
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title, entity, source, tactic, status, or severity"
              />
            </label>

            <label className="field">
              Severity
              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value as SeverityFilter)}
              >
                {severityFilters.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                {statusFilters.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <button className="ghost-button filter-clear-button" onClick={clearFilters} disabled={!filtersActive}>
              Clear filters
            </button>
          </div>
        </section>
      )}

      {data ? (
        <AlertTable alerts={filteredAlerts} />
      ) : (
        <div className="panel skeleton">Loading alerts...</div>
      )}
    </main>
  );
}
