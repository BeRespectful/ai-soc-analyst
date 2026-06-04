import type {
  AiAnalysis,
  Alert,
  AlertCollection,
  AlertWorkflowStatus,
  Investigation,
  KqlCopilotResponse,
  KqlQuery,
  Verdict,
  VerdictResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function getAlerts(): Promise<AlertCollection> {
  return request<AlertCollection>("/api/alerts");
}

export function getAlert(alertId: string): Promise<Alert> {
  return request<Alert>(`/api/alerts/${alertId}`);
}

export function getInvestigation(alertId: string): Promise<Investigation> {
  return request<Investigation>(`/api/alerts/${alertId}/investigation`);
}

export function getAiAnalysis(alertId: string): Promise<AiAnalysis> {
  return request<AiAnalysis>(`/api/alerts/${alertId}/analysis`);
}

export function updateAlertStatus(
  alertId: string,
  status: AlertWorkflowStatus,
): Promise<Alert> {
  return request<Alert>(`/api/alerts/${alertId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function generateKql(alertId: string, objective: string): Promise<KqlQuery> {
  return request<KqlQuery>("/api/kql/generate", {
    method: "POST",
    body: JSON.stringify({ alert_id: alertId, objective }),
  });
}

export function generateKqlCopilot(
  investigationRequest: string,
  alertId?: string,
): Promise<KqlCopilotResponse> {
  return request<KqlCopilotResponse>("/api/kql-copilot", {
    method: "POST",
    body: JSON.stringify({
      alert_id: alertId,
      investigation_request: investigationRequest,
    }),
  });
}

export function submitVerdict(
  alertId: string,
  verdict: Verdict,
  analystNotes: string,
): Promise<VerdictResponse> {
  return request<VerdictResponse>("/api/verdicts", {
    method: "POST",
    body: JSON.stringify({
      alert_id: alertId,
      verdict,
      analyst_notes: analystNotes,
    }),
  });
}
