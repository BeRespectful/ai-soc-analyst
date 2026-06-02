import { Link } from "react-router-dom";

import type { AlertSummary } from "../types";
import { SeverityBadge } from "./SeverityBadge";

interface AlertTableProps {
  alerts: AlertSummary[];
}

export function AlertTable({ alerts }: AlertTableProps) {
  return (
    <div className="panel table-panel">
      <div className="panel-header">
        <div>
          <p>Security alerts</p>
          <h2>Active queue</h2>
        </div>
        <span>{alerts.length} alerts</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Alert</th>
              <th>Severity</th>
              <th>Entity</th>
              <th>Source</th>
              <th>Status</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td>
                  <Link to={`/alerts/${alert.id}`} className="alert-link">
                    <strong>{alert.title}</strong>
                    <span>{alert.id} &middot; {alert.tactic}</span>
                  </Link>
                </td>
                <td>
                  <SeverityBadge severity={alert.severity} />
                </td>
                <td>{alert.entity}</td>
                <td>{alert.source}</td>
                <td>
                  <span className="status-pill">{alert.status}</span>
                </td>
                <td>
                  <div className="risk-meter">
                    <span style={{ width: `${alert.risk_score}%` }} />
                  </div>
                  <small>{alert.risk_score}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
