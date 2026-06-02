import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
  tone?: "neutral" | "critical" | "high" | "medium" | "low";
}

export function StatCard({ label, value, helper, icon, tone = "neutral" }: StatCardProps) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{helper}</span>
      </div>
    </article>
  );
}
