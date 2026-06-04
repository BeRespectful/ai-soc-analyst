import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Network, Radar } from "lucide-react";

import { getAlert, getInvestigation, updateInvestigationNotes } from "../api/client";
import { AiSummaryPanel } from "../components/AiSummaryPanel";
import { AlertStatusSelect } from "../components/AlertStatusSelect";
import { KqlCopilotPanel } from "../components/KqlCopilotPanel";
import { KqlPanel } from "../components/KqlPanel";
import { MITREPanel } from "../components/MITREPanel";
import { SeverityBadge } from "../components/SeverityBadge";
import type { Alert, Investigation as InvestigationType } from "../types";

export function Investigation() {
  const { alertId = "" } = useParams();
  const [alert, setAlert] = useState<Alert>();
  const [investigation, setInvestigation] = useState<InvestigationType>();
  const [notes, setNotes] = useState("");
  const [notesStatus, setNotesStatus] = useState<string>();
  const [notesError, setNotesError] = useState<string>();
  const [savingNotes, setSavingNotes] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!alertId) {
      return;
    }

    Promise.all([getAlert(alertId), getInvestigation(alertId)])
      .then(([alertPayload, investigationPayload]) => {
        setAlert(alertPayload);
        setInvestigation(investigationPayload);
        setNotes(alertPayload.analyst_notes);
        setNotesStatus(undefined);
        setNotesError(undefined);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load investigation"));
  }, [alertId]);

  async function handleSaveNotes() {
    if (!alert) {
      return;
    }

    setSavingNotes(true);
    setNotesStatus(undefined);
    setNotesError(undefined);
    try {
      const updatedAlert = await updateInvestigationNotes(alert.id, notes);
      setAlert(updatedAlert);
      setNotes(updatedAlert.analyst_notes);
      setNotesStatus("Notes saved");
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : "Unable to save notes");
    } finally {
      setSavingNotes(false);
    }
  }

  if (error) {
    return <main className="page"><div className="error-banner">{error}</div></main>;
  }

  if (!alert || !investigation) {
    return <main className="page"><div className="panel skeleton">Loading investigation...</div></main>;
  }

  return (
    <main className="page investigation-page">
      <Link to={`/alerts/${alert.id}`} className="back-link">
        <ArrowLeft size={16} />
        Back to alert
      </Link>

      <section className="detail-hero">
        <div>
          <SeverityBadge severity={alert.severity} />
          <h1>Investigation: {alert.id}</h1>
          <p>{alert.title}</p>
        </div>
        <div className="detail-actions">
          <div className="entity-chip">
            <Network size={18} />
            {alert.entity}
          </div>
          <AlertStatusSelect
            alertId={alert.id}
            status={alert.status}
            onStatusChange={setAlert}
          />
        </div>
      </section>

      <section className="investigation-grid">
        <div className="panel timeline-panel">
          <div className="panel-header">
            <div>
              <p>Investigation timeline</p>
              <h2>Signal progression</h2>
            </div>
            <Radar size={24} />
          </div>

          <div className="timeline">
            {investigation.timeline.map((event) => (
              <article key={`${event.time}-${event.activity}`}>
                <span>{event.time}</span>
                <div>
                  <strong>{event.activity}</strong>
                  <p>{event.signal}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p>Entities</p>
              <h2>Scope and assets</h2>
            </div>
          </div>
          <div className="entity-list">
            {investigation.entities.map((entity) => (
              <span key={entity}>{entity}</span>
            ))}
          </div>
          <h3>Playbook steps</h3>
          <ul className="signal-list">
            {investigation.playbook_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </section>

      <AiSummaryPanel alert={alert} />
      <KqlCopilotPanel alertId={alert.id} />
      <MITREPanel alert={alert} />

      <section className="panel notes-panel">
        <div className="panel-header">
          <div>
            <p>Analyst notes</p>
            <h2>Investigation journal</h2>
          </div>
          <FileText size={24} />
        </div>
        <label className="field">
          Notes for this alert
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Document pivots, evidence, owner feedback, and next actions."
            rows={5}
          />
        </label>
        <div className="notes-actions">
          <button className="primary-button" onClick={handleSaveNotes} disabled={savingNotes}>
            {savingNotes ? "Saving..." : "Save notes"}
          </button>
          {notesStatus && <span className="success-text">{notesStatus}</span>}
          {notesError && <span className="error-text">{notesError}</span>}
        </div>
      </section>

      <KqlPanel alertId={alert.id} />
    </main>
  );
}
