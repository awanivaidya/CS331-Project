import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import SentimentBadge from "../components/SentimentBadge";

export default function DashboardPage() {
  const { isManager } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/alerts/dashboard")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    const customers = data?.customers || [];
    return customers.map((c) => ({
      name: c.name,
      score: Number(c.sentimentScore || 0),
    }));
  }, [data]);

  if (loading) return <div className="page-shell">Loading dashboard...</div>;

  return (
    <div className="page-shell">
      <h2>{isManager ? "Manager Dashboard" : "Staff Dashboard"}</h2>
      <div className="card-grid">
        <article className="card stat-card">
          <h3>Total Customers</h3>
          <strong>{data?.totalCustomers || 0}</strong>
        </article>
        <article className="card stat-card">
          <h3>Critical</h3>
          <strong>{data?.criticalCount || 0}</strong>
        </article>
        <article className="card stat-card">
          <h3>Warning</h3>
          <strong>{data?.warningCount || 0}</strong>
        </article>
        <article className="card stat-card">
          <h3>Stable</h3>
          <strong>{data?.stableCount || 0}</strong>
        </article>
      </div>

      <section className="card">
        <h3>Sentiment Snapshot</h3>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" hide />
              <YAxis domain={[-1, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <h3>Customer Risk Table</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Priority</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {(data?.customers || []).map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.priority}</td>
                  <td>
                    <SentimentBadge score={c.sentimentScore} riskStatus={c.riskStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
