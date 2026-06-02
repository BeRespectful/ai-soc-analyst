import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Flame, ShieldCheck, Siren } from "lucide-react";

import { getAlerts } from "../api/client";
import { AlertTable } from "../components/AlertTable";
import { StatCard } from "../components/StatCard";
import type { AlertCollection } from "../types";

export function Dashboard() {
  const [data, setData] = useState<AlertCollection>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    getAlerts()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load alerts"));
  }, []);

  const topAlert = useMemo(() => data?.alerts[0], [data]);

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
          helper="Current sample queue"
          icon={<ShieldCheck size={22} />}
        />
        <StatCard
          label="Critical"
          value={data?.severity_counts.Critical ?? "--"}
          helper="Immediate escalation"
          icon={<Siren size={22} />}
          tone="critical"
        />
        <StatCard
          label="High"
          value={data?.severity_counts.High ?? "--"}
          helper="Needs triage"
          icon={<Flame size={22} />}
          tone="high"
        />
        <StatCard
          label="Medium / Low"
          value={
            data
              ? `${data.severity_counts.Medium + data.severity_counts.Low}`
              : "--"
          }
          helper="Monitor and tune"
          icon={<AlertTriangle size={22} />}
          tone="medium"
        />
      </section>

      {data ? <AlertTable alerts={data.alerts} /> : <div className="panel skeleton">Loading alerts...</div>}
    </main>
  );
}
