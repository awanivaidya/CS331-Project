import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function RiskAlertBanner() {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let alive = true;

    const pull = async () => {
      try {
        const { data } = await api.get("/alerts/critical");
        if (!alive) return;
        setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
      } catch {
        if (!alive) return;
        setAlerts([]);
      }
    };

    pull();
    const id = setInterval(pull, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    setDismissed(false);
  }, [alerts.length]);

  if (!alerts.length || dismissed) return null;

  const top = alerts[0];
  return (
    <div className="risk-banner" role="alert">
      <div>
        <strong>Critical Risk Alert:</strong> {top.message}
      </div>
      <div className="risk-banner-actions">
        <Link to="/alerts">View Alerts</Link>
        {top.customer?.id ? <Link to="/customers">Open Customer List</Link> : null}
        <button type="button" onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
