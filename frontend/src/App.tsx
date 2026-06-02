import { Route, Routes } from "react-router-dom";

import { Sidebar } from "./components/Sidebar";
import { AlertDetails } from "./pages/AlertDetails";
import { Dashboard } from "./pages/Dashboard";
import { Investigation } from "./pages/Investigation";

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alerts/:alertId" element={<AlertDetails />} />
        <Route path="/investigation/:alertId" element={<Investigation />} />
      </Routes>
    </div>
  );
}
