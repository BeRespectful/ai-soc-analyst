import { BrainCircuit, Sparkles } from "lucide-react";

import type { AiAnalysis } from "../types";

interface AiAnalysisPanelProps {
  analysis?: AiAnalysis;
  loading?: boolean;
}

export function AiAnalysisPanel({ analysis, loading = false }: AiAnalysisPanelProps) {
  return (
    <section className="panel ai-panel">
      <div className="panel-header">
        <div>
          <p>AI analysis</p>
          <h2>Analyst copilot assessment</h2>
        </div>
        <BrainCircuit size={24} />
      </div>

      {loading && <div className="skeleton">Generating assessment...</div>}

      {analysis && (
        <>
          <div className="ai-summary">
            <Sparkles size={18} />
            <p>{analysis.executive_summary}</p>
          </div>

          <div className="confidence-bar">
            <span>AI confidence</span>
            <strong>{analysis.confidence}%</strong>
            <div>
              <i style={{ width: `${analysis.confidence}%` }} />
            </div>
          </div>

          <div className="split-list">
            <div>
              <h3>Likely attack path</h3>
              <ol>
                {analysis.likely_attack_path.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3>Recommended next steps</h3>
              <ul>
                {analysis.recommended_next_steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="hypothesis">
            <span>Hypothesis</span>
            <p>{analysis.hypothesis}</p>
          </div>
        </>
      )}
    </section>
  );
}
