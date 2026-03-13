import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import SentimentBadge from "../components/SentimentBadge";

const initialEmail = {
  type: "email",
  subject: "",
  sender: "",
  content: "",
  meetingDate: "",
  participants: "",
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { isManager } = useAuth();
  const [project, setProject] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [form, setForm] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const fetchAll = async () => {
    const [pRes, cRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/communications?projectId=${id}`),
    ]);
    setProject(pRes.data);
    setCommunications(cRes.data || []);
  };

  useEffect(() => {
    fetchAll().catch(() => setError("Failed to load project data"));
  }, [id]);

  const customerSentiment = useMemo(() => {
    if (!communications.length) return null;
    const latest = [...communications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    )[0];
    return latest?.sentiment;
  }, [communications]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!project) return;

    setSubmitting(true);
    setError("");
    setAlertMessage("");

    try {
      if (form.type === "email") {
        const payload = {
          content: form.content,
          subject: form.subject,
          sender: form.sender,
          projectId: project._id,
          domainId: project.domainId?._id || project.domainId,
          customerId: project.customerId?._id || project.customerId,
        };
        const { data } = await api.post("/communications/email", payload);
        if (data.alert?.message) setAlertMessage(data.alert.message);
      } else {
        const payload = {
          content: form.content,
          meetingDate: form.meetingDate,
          participants: form.participants
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          projectId: project._id,
          domainId: project.domainId?._id || project.domainId,
          customerId: project.customerId?._id || project.customerId,
        };
        const { data } = await api.post("/communications/transcript", payload);
        if (data.alert?.message) setAlertMessage(data.alert.message);
      }

      setForm(initialEmail);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add communication");
    } finally {
      setSubmitting(false);
    }
  };

  if (!project) return <div className="page-shell">Loading project details...</div>;

  return (
    <div className="page-shell">
      <h2>{project.name}</h2>
      <div className="card-grid">
        <section className="card">
          <h3>Project Meta</h3>
          <p>Customer: {project.customerId?.name || "-"}</p>
          <p>Domain: {project.domainId?.name || "-"}</p>
          <p>Status: {project.status}</p>
          <p>
            Current Communication Sentiment: <SentimentBadge score={customerSentiment || 0} />
          </p>
        </section>

        <section className="card">
          <h3>To-Do Tasks (NLP)</h3>
          <ul className="task-list">
            {(project.tasks || []).map((task, idx) => (
              <li key={`${task}-${idx}`}>{task}</li>
            ))}
          </ul>
        </section>
      </div>

      {isManager ? (
        <section className="card">
          <h3>Add Communication</h3>
          <form className="stack" onSubmit={onSubmit}>
            <label>
              Type
              <select
                value={form.type}
                onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
              >
                <option value="email">Email</option>
                <option value="transcript">Meeting Transcript</option>
              </select>
            </label>

            {form.type === "email" ? (
              <>
                <label>
                  Subject
                  <input
                    required
                    value={form.subject}
                    onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
                  />
                </label>
                <label>
                  Sender
                  <input
                    required
                    value={form.sender}
                    onChange={(e) => setForm((s) => ({ ...s, sender: e.target.value }))}
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Meeting Date
                  <input
                    type="date"
                    required
                    value={form.meetingDate}
                    onChange={(e) => setForm((s) => ({ ...s, meetingDate: e.target.value }))}
                  />
                </label>
                <label>
                  Participants (comma-separated)
                  <input
                    required
                    value={form.participants}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, participants: e.target.value }))
                    }
                  />
                </label>
              </>
            )}

            <label>
              Content
              <textarea
                required
                rows={6}
                value={form.content}
                onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
              />
            </label>

            {error ? <div className="error">{error}</div> : null}
            {alertMessage ? <div className="warn">{alertMessage}</div> : null}

            <button type="submit" disabled={submitting}>
              {submitting ? "Analyzing with NLP..." : "Add & Analyze"}
            </button>
          </form>
        </section>
      ) : null}

      <section className="card">
        <h3>Communication History</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Summary</th>
                <th>Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {communications.map((c) => (
                <tr key={c._id}>
                  <td>{c.type}</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                  <td>{c.summary || "-"}</td>
                  <td>
                    <SentimentBadge score={c.sentiment || 0} />
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
