import { useState } from "react";

import { updateAlertStatus } from "../api/client";
import type { Alert, AlertStatus, AlertWorkflowStatus } from "../types";

const workflowStatuses: AlertWorkflowStatus[] = ["New", "In Progress", "Closed"];

interface AlertStatusSelectProps {
  alertId: string;
  status: AlertStatus;
  onStatusChange: (alert: Alert) => void;
}

export function AlertStatusSelect({
  alertId,
  status,
  onStatusChange,
}: AlertStatusSelectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const isWorkflowStatus = workflowStatuses.includes(status as AlertWorkflowStatus);

  async function handleStatusChange(nextStatus: AlertWorkflowStatus) {
    setLoading(true);
    setError(undefined);
    try {
      onStatusChange(await updateAlertStatus(alertId, nextStatus));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update alert status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="status-control">
      <label>
        Status
        <select
          value={status}
          onChange={(event) => handleStatusChange(event.target.value as AlertWorkflowStatus)}
          disabled={loading}
        >
          {!isWorkflowStatus && <option value={status}>{status}</option>}
          {workflowStatuses.map((workflowStatus) => (
            <option key={workflowStatus} value={workflowStatus}>
              {workflowStatus}
            </option>
          ))}
        </select>
      </label>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
