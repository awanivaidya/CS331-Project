import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import SentimentBadge from "../components/SentimentBadge";
import { useAuth } from "../context/AuthContext";

const stakeholders = [
  { initials: "JD", name: "John Doe", role: "CTO" },
  { initials: "JS", name: "Jane Smith", role: "IT Director" },
  { initials: "RJ", name: "Robert Johnson", role: "VP Sales" },
];

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const { isManager } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [projects, setProjects] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get(`/customers/${id}`),
      api.get(`/projects?customerId=${id}`),
      api.get(`/communications?customerId=${id}`),
    ])
      .then(([cRes, pRes, commRes]) => {
        setCustomer(cRes.data);
        setProjects(pRes.data || []);
        setCommunications(commRes.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error || "Failed to load customer details",
        );
        setLoading(false);
      });
  }, [id]);

  const summary = useMemo(() => {
    const active = projects.filter((p) => p.status === "active").length;
    const sentimentHistory = customer?.sentimentHistory || [];
    const latest =
      sentimentHistory[sentimentHistory.length - 1]?.score ??
      customer?.sentimentScore ??
      0;
    const previous =
      sentimentHistory[sentimentHistory.length - 2]?.score ?? latest;
    const delta = Number(latest) - Number(previous);
    return {
      active,
      total: projects.length,
      communications: communications.length,
      trend: delta > 0 ? "Improving" : delta < 0 ? "Declining" : "Stable",
    };
  }, [projects, communications, customer]);

  const recentCommunications = useMemo(
    () =>
      [...communications]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5),
    [communications],
  );

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  const onDeleteProject = async (project) => {
    const confirmed = window.confirm(
      `Delete project "${project.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setError("");
    setDeletingProjectId(project._id);
    try {
      await api.delete(`/projects/${project._id}`);
      setProjects((prev) => prev.filter((p) => p._id !== project._id));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete project");
    } finally {
      setDeletingProjectId(null);
    }
  };

  if (loading) return <div className="page-shell">Loading customer...</div>;
  if (error)
    return (
      <div className="page-shell">
        <div className="error">{error}</div>
      </div>
    );
  if (!customer) return <div className="page-shell">Customer not found.</div>;

  return (
    <div className="page-shell">
      <section className="card hero-card">
        <div className="hero-head">
          <h2>{customer.name}</h2>
          <SentimentBadge
            score={customer.sentimentScore}
            riskStatus={customer.riskStatus}
          />
        </div>
        <p className="muted">
          Domain: {customer.domainId?.name || "-"} | Priority:{" "}
          {customer.priority || "normal"}
        </p>
      </section>

      <div className="split-grid">
        <section className="card">
          <h3>Customer Summary</h3>
          <div className="summary-grid">
            <div>
              <span>Active Engagements</span>
              <strong>{summary.active}</strong>
            </div>
            <div>
              <span>Total Engagements</span>
              <strong>{summary.total}</strong>
            </div>
            <div>
              <span>Communications</span>
              <strong>{summary.communications}</strong>
            </div>
            <div>
              <span>Risk Status</span>
              <strong>{customer.riskStatus || "stable"}</strong>
            </div>
            <div>
              <span>Sentiment Trend</span>
              <strong>{summary.trend}</strong>
            </div>
            <div>
              <span>Created</span>
              <strong>{formatDate(customer.createdAt)}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <h3>Key Stakeholders</h3>
          <ul className="stake-list">
            {stakeholders.map((s) => (
              <li key={s.initials}>
                <span className="chip-avatar">{s.initials}</span>
                <div>
                  <strong>{s.name}</strong>
                  <small>{s.role}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card table-wrap">
        <div className="section-head">
          <h3>Projects</h3>
        </div>
        <table className="customer-projects-table">
          <colgroup>
            <col className="col-project" />
            <col className="col-domain" />
            <col className="col-status" />
            <col className="col-tasks" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Project</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Tasks</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.domainId?.name || "-"}</td>
                <td>{p.status}</td>
                <td>{(p.tasks || []).length}</td>
                <td className="actions-col">
                  <div className="actions-group">
                    <Link className="btn-open" to={`/projects/${p._id}`}>
                      Open
                    </Link>
                    {isManager ? (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => onDeleteProject(p)}
                        disabled={deletingProjectId === p._id}
                      >
                        {deletingProjectId === p._id ? "Deleting..." : "Delete"}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <div className="section-head">
          <h3>Recent Communications</h3>
          <span className="muted">Latest 5 records</span>
        </div>
        <ul className="activity-list">
          {recentCommunications.map((comm) => (
            <li key={comm._id}>
              <strong>{comm.subject || "Untitled communication"}</strong>
              <p className="muted">
                {comm.type} | {formatDate(comm.timestamp)} |{" "}
                {comm.sender || "Unknown sender"}
              </p>
            </li>
          ))}
          {!recentCommunications.length ? (
            <li>
              <strong>No communications yet</strong>
              <p className="muted">
                Communications linked to this customer will appear here.
              </p>
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
