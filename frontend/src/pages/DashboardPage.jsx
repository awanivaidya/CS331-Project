import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/alerts/dashboard"),
      api.get("/projects"),
      api.get("/slas"),
    ])
      .then(([dashboardRes, projectsRes, slasRes]) => {
        setData(dashboardRes.data);
        setProjects(projectsRes.data || []);
        setSlas(slasRes.data || []);
      })
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load dashboard"),
      )
      .finally(() => setLoading(false));
  }, []);

  const atRiskRows = useMemo(() => {
    const projectByCustomer = new Map(
      projects.map((p) => [p.customerId?._id || p.customerId, p]),
    );
    const customers = data?.customers || [];
    return customers
      .filter((c) => c.riskStatus === "warning" || c.riskStatus === "critical")
      .slice(0, 6)
      .map((c) => {
        const linkedProject = projectByCustomer.get(c._id);
        return {
          client: c.name,
          customerId: c._id,
          engagement: linkedProject?.name || "No linked project",
          type: c.riskStatus === "critical" ? "High" : "Medium",
          owner: linkedProject?.status || "N/A",
        };
      });
  }, [data, projects]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return [...slas]
      .filter((sla) => sla?.deadline)
      .map((sla) => {
        const dueDate = new Date(sla.deadline);
        const daysUntil = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          id: sla._id,
          customerName: sla.customerId?.name || "Unknown customer",
          dueDate,
          daysUntil,
        };
      })
      .filter((item) => !Number.isNaN(item.dueDate.getTime()))
      .sort((a, b) => a.dueDate - b.dueDate)
      .slice(0, 5);
  }, [slas]);

  const statusStats = useMemo(() => {
    const good = data?.stableCount || 0;
    const warning = data?.warningCount || 0;
    const critical = data?.criticalCount || 0;
    const total = good + warning + critical || 1;
    return {
      good,
      warning,
      critical,
      goodPct: (good / total) * 100,
      warningPct: (warning / total) * 100,
    };
  }, [data]);

  if (loading) return <div className="page-shell">Loading dashboard...</div>;
  if (error)
    return (
      <div className="page-shell">
        <div className="error">{error}</div>
      </div>
    );

  const totalCustomers = data?.totalCustomers || 0;
  const activeEngagements = projects.filter(
    (p) => p.status === "active",
  ).length;

  const formatDeadlineLabel = (deadline) => {
    if (deadline.daysUntil < 0)
      return `${deadline.customerName} - Overdue by ${Math.abs(deadline.daysUntil)} day(s)`;
    if (deadline.daysUntil === 0) return `${deadline.customerName} - Due today`;
    if (deadline.daysUntil === 1)
      return `${deadline.customerName} - Due tomorrow`;
    return `${deadline.customerName} - Due in ${deadline.daysUntil} days`;
  };

  return (
    <div className="page-shell dashboard-grid">
      <h2>Dashboard</h2>

      <section className="metric-row">
        <article className="card metric-card">
          <div className="section-head">
            <h3>Total Customers</h3>
            <span className="metric-plus">+</span>
          </div>
          <strong>{totalCustomers}</strong>
        </article>
        <article className="card metric-card">
          <div className="section-head">
            <h3>Active Engagements</h3>
            <span className="metric-plus">+</span>
          </div>
          <strong>{activeEngagements}</strong>
        </article>
        <article className="card status-card">
          <div className="section-head">
            <h3>Engagement Status</h3>
            <span className="metric-plus">+</span>
          </div>
          <div className="status-ring-wrap">
            <div
              className="status-ring"
              style={{
                "--good-pct": statusStats.goodPct,
                "--warn-pct": statusStats.warningPct,
              }}
            >
              {totalCustomers} Customers
            </div>
          </div>
          <div className="status-legend">
            <span>
              <i className="dot good" /> Good ({statusStats.good})
            </span>
            <span>
              <i className="dot warn" /> Warning ({statusStats.warning})
            </span>
            <span>
              <i className="dot crit" /> Critical ({statusStats.critical})
            </span>
          </div>
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <h3>Recent Activity</h3>
          <Link to="/alerts">View all activity</Link>
        </div>
        <ul className="activity-list">
          {(data?.alerts || []).slice(0, 4).map((a, i) => (
            <li key={`${a.customer?.id || i}-${i}`}>
              <strong>{a.customer?.name}</strong> moved to{" "}
              <span>{a.severity}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Upcoming Deadlines</h3>
        <ul className="alert-list">
          {upcomingDeadlines.map((deadline) => (
            <li key={deadline.id}>{formatDeadlineLabel(deadline)}</li>
          ))}
          {!upcomingDeadlines.length ? (
            <li>No SLA deadlines available yet.</li>
          ) : null}
        </ul>
      </section>

      <section className="card">
        <h3>At-Risk Engagements</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Engagement</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {atRiskRows.map((row) => (
                <tr key={`${row.client}-${row.engagement}`}>
                  <td>{row.client}</td>
                  <td>{row.engagement}</td>
                  <td
                    className={
                      row.type === "High" ? "critical-line" : "warning-line"
                    }
                  >
                    {row.type}
                  </td>
                  <td>{row.owner}</td>
                  <td>
                    <Link to={`/customers/${row.customerId}`}>View</Link>
                  </td>
                </tr>
              ))}
              {!atRiskRows.length ? (
                <tr>
                  <td colSpan={5}>No at-risk engagements right now.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
