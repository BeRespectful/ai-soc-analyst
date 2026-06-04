import { Crosshair, ExternalLink } from "lucide-react";

import type { Alert } from "../types";

interface MITREPanelProps {
  alert: Alert;
}

interface MitreTechniqueReference {
  description: string;
  whyThisMatters: string;
  detectionGuidance: string[];
  investigationGuidance: string[];
}

const mitreReferences: Record<string, MitreTechniqueReference> = {
  T1078: {
    description:
      "Adversaries may obtain and abuse valid accounts to gain initial access, maintain persistence, or move through the environment while blending in with expected user activity.",
    whyThisMatters:
      "Valid account abuse can look like normal sign-in behavior, so analysts should quickly validate identity, session, and mailbox changes tied to privileged users.",
    detectionGuidance: [
      "Correlate impossible travel, unfamiliar ASN, and new device or compliant-device claims.",
      "Monitor privileged accounts for risky sign-ins followed by mailbox, role, or policy changes.",
      "Hunt for forwarding rules, session refreshes, and authentication anomalies around the alert time.",
    ],
    investigationGuidance: [
      "Confirm whether the user recognizes each sign-in location, device, and application.",
      "Review recent mailbox rules, privileged role activations, and session tokens for the account.",
      "Scope similar activity across users with matching source IPs, ASNs, or forwarding destinations.",
    ],
  },
  T1486: {
    description:
      "Adversaries may encrypt data on target systems to interrupt availability and pressure recovery or ransom payment.",
    whyThisMatters:
      "Ransomware behavior can spread quickly from one endpoint to shared resources, so containment and backup validation are time sensitive.",
    detectionGuidance: [
      "Alert on rapid file rename or write bursts, shadow copy deletion, and suspicious encryption extensions.",
      "Correlate process trees that launch recovery-disabling tools such as vssadmin or wbadmin.",
      "Watch for unusual outbound connections around encryption activity.",
    ],
    investigationGuidance: [
      "Identify the first process and parent process that initiated encryption behavior.",
      "Scope affected files, shares, and user sessions before reconnecting the host.",
      "Preserve forensic artifacts before remediation where incident response requires it.",
    ],
  },
  T1531: {
    description:
      "Adversaries may interrupt availability by deleting, locking, or otherwise removing account access.",
    whyThisMatters:
      "Account access changes can disrupt response and persistence controls, especially when OAuth grants or identity configuration are involved.",
    detectionGuidance: [
      "Monitor unexpected application consent, permission grants, and account access policy changes.",
      "Correlate identity configuration changes with new apps or unverified publishers.",
      "Alert on permission changes that affect mail, identity, or tenant-wide access.",
    ],
    investigationGuidance: [
      "Validate the application publisher, consent actor, and requested scopes.",
      "Review recent identity changes by the same actor or application.",
      "Revoke suspicious grants and check for persistence across related service principals.",
    ],
  },
};

function buildFallbackReference(alert: Alert): MitreTechniqueReference {
  return {
    description: alert.description,
    whyThisMatters: `${alert.technique} activity maps to ${alert.tactic}, so analysts should validate the primary entity and confirm whether the behavior is expected.`,
    detectionGuidance: [
      `Correlate ${alert.source} signals for ${alert.entity} around the alert time.`,
      `Hunt for additional ${alert.technique} indicators across related identities, hosts, and cloud assets.`,
      "Compare the alert evidence against known-good administrative or user activity.",
    ],
    investigationGuidance: [
      `Review the affected assets: ${alert.affected_assets.join(", ")}.`,
      "Validate whether the activity was authorized by the entity owner or service owner.",
      "Expand the investigation to similar entities, source IPs, applications, and commands.",
    ],
  };
}

export function MITREPanel({ alert }: MITREPanelProps) {
  const reference = mitreReferences[alert.mitre_id] ?? buildFallbackReference(alert);
  const techniqueUrl = `https://attack.mitre.org/techniques/${alert.mitre_id}/`;

  return (
    <section className="panel mitre-panel">
      <div className="panel-header">
        <div>
          <p>MITRE ATT&CK</p>
          <h2>{alert.technique}</h2>
        </div>
        <Crosshair size={24} />
      </div>

      <div className="mitre-summary">
        <div>
          <span>Technique ID</span>
          <strong>{alert.mitre_id}</strong>
        </div>
        <div>
          <span>Technique name</span>
          <strong>{alert.technique}</strong>
        </div>
        <div>
          <span>Tactic</span>
          <strong>{alert.tactic}</strong>
        </div>
        <a href={techniqueUrl} target="_blank" rel="noreferrer">
          MITRE reference
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="mitre-context">
        <div>
          <span>Description</span>
          <p>{reference.description}</p>
        </div>
        <div>
          <span>Why this matters</span>
          <p>{reference.whyThisMatters}</p>
        </div>
      </div>

      <div className="mitre-reference-grid">
        <div>
          <h3>Detection guidance</h3>
          <ul className="signal-list">
            {reference.detectionGuidance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Investigation guidance</h3>
          <ul className="signal-list">
            {reference.investigationGuidance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Recommended actions</h3>
          <ul className="signal-list">
            {alert.recommended_actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
