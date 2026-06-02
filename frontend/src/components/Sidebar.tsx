import { Activity, BrainCircuit, Gauge, Search, ShieldAlert, TerminalSquare } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/", icon: Gauge },
  { label: "Alerts", path: "/", icon: ShieldAlert },
  { label: "Investigation", path: "/investigation/ALRT-2026-0001", icon: Search },
  { label: "AI Analysis", path: "/alerts/ALRT-2026-0001", icon: BrainCircuit },
  { label: "KQL Studio", path: "/investigation/ALRT-2026-0001", icon: TerminalSquare },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Activity size={22} />
        </div>
        <div>
          <span>Sentinel AI</span>
          <strong>SOC Analyst</strong>
        </div>
      </div>

      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.label} to={item.path} className="nav-link">
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-card">
        <span>Workspace</span>
        <strong>Contoso Security Operations</strong>
        <p>AI-assisted triage and threat hunting for high signal alerts.</p>
      </div>
    </aside>
  );
}
