import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ProjectsPage() {
  const { isManager } = useAuth();
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [createForm, setCreateForm] = useState({ name: "", customerId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [pRes, cRes] = await Promise.all([
      api.get("/projects"),
      api.get("/customers"),
    ]);
    setProjects(pRes.data || []);
    setCustomers(cRes.data || []);
  };

  useEffect(() => {
    load()
      .catch(() => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/projects", {
        name: createForm.name,
        customerId: createForm.customerId,
      });
      setCreateForm({ name: "", customerId: "" });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create project");
    }
  };

  if (loading) return <div className="page-shell">Loading projects...</div>;

  return (
    <div className="page-shell">
      <h2>Projects</h2>

      {isManager ? (
        <section className="card">
          <h3>Create Project</h3>
          <form className="inline-form" onSubmit={onCreate}>
            <input
              required
              placeholder="Project name"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, name: e.target.value }))
              }
            />
            <select
              required
              value={createForm.customerId}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, customerId: e.target.value }))
              }
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="submit">Create</button>
          </form>
          {error ? <div className="error">{error}</div> : null}
        </section>
      ) : null}

      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Customer</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Tasks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.customerId?.name || "-"}</td>
                <td>{p.domainId?.name || "-"}</td>
                <td>{p.status}</td>
                <td>{Array.isArray(p.tasks) ? p.tasks.length : 0}</td>
                <td>
                  <Link to={`/projects/${p._id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
