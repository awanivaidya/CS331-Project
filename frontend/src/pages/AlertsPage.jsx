import { useEffect, useState } from "react";
import api from "../api/client";

export default function AlertsPage() {
  const [critical, setCritical] = useState([]);
  const [warning, setWarning] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/alerts/critical"), api.get("/alerts/dashboard")]).then(
      ([cRes, dRes]) => {
        setCritical(cRes.data?.alerts || []);
        const warningCustomers = (dRes.data?.customers || []).filter(
          (c) => c.riskStatus === "warning",
        );
        setWarning(warningCustomers);
      },
    );
  }, []);

  return (
    <div className="page-shell">
      <h2>Risk Alerts</h2>
      <section className="card">
        <h3>Critical Alerts ({critical.length})</h3>
        <ul className="alert-list">
          {critical.map((a) => (
            <li key={`${a.customer.id}-${a.project.id}`} className="critical-line">
              <strong>{a.customer.name}</strong> / {a.project.name} - {a.message}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Warning Customers ({warning.length})</h3>
        <ul className="alert-list">
          {warning.map((w) => (
            <li key={w._id} className="warning-line">
              {w.name} - sentiment {Number(w.sentimentScore).toFixed(2)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
