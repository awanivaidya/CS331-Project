import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const initialProjectForm = {
  name: "",
  status: "active",
  customerId: "",
  domainId: "",
  responseTime: 8,
  deadline: "",
  riskThreshold: -0.4,
};

export default function ProjectsPage() {
  const { isManager } = useAuth();
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [createForm, setCreateForm] = useState(initialProjectForm);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const load = async () => {
    const [pRes, cRes, dRes] = await Promise.all([
      api.get("/projects"),
      api.get("/customers"),
      api.get("/domains"),
    ]);
    setProjects(pRes.data || []);
    setCustomers(cRes.data || []);
    setDomains(dRes.data || []);
  };

  useEffect(() => {
    load()
      .catch(() => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  const onCustomerChange = (customerId) => {
    const selectedCustomer = customers.find((c) => c._id === customerId);
    const domainId =
      selectedCustomer?.domainId?._id || selectedCustomer?.domainId || "";
    setCreateForm((s) => ({ ...s, customerId, domainId }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.post("/projects", {
        name: createForm.name,
        status: createForm.status,
        customerId: createForm.customerId,
        domainId: createForm.domainId,
        sla: {
          responseTime: Number(createForm.responseTime),
          deadline: createForm.deadline,
          riskThreshold: Number(createForm.riskThreshold),
        },
      });
      setCreateForm(initialProjectForm);
      await load();
      return true;
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create project");
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-shell">Loading projects...</div>;

  return (
    <div className="page-shell">
      <div className="page-title-row">
        <h2>Engagement Projects</h2>
        {isManager ? (
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setCreateForm(initialProjectForm);
              setShowCreateModal(true);
            }}
          >
            Create Project
          </button>
        ) : null}
      </div>

      {error ? <div className="error">{error}</div> : null}

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

      {isManager && showCreateModal ? (
        <div
          className="modal-backdrop"
          onClick={() => setShowCreateModal(false)}
        >
          <section
            className="card modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-head">
              <h3>Create Project</h3>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Close
              </button>
            </div>
            <form
              className="grid-form"
              onSubmit={async (e) => {
                const success = await onCreate(e);
                if (success) setShowCreateModal(false);
              }}
            >
              <label>
                Project Name
                <input
                  required
                  placeholder="Project name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </label>
              <label>
                Customer
                <select
                  required
                  value={createForm.customerId}
                  onChange={(e) => onCustomerChange(e.target.value)}
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Domain
                <select
                  required
                  value={createForm.domainId}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, domainId: e.target.value }))
                  }
                >
                  <option value="">Select domain</option>
                  {domains.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                SLA Response Time (hours)
                <input
                  type="number"
                  min="1"
                  required
                  value={createForm.responseTime}
                  onChange={(e) =>
                    setCreateForm((s) => ({
                      ...s,
                      responseTime: Number(e.target.value),
                    }))
                  }
                />
              </label>
              <label>
                SLA Deadline
                <input
                  type="date"
                  required
                  value={createForm.deadline}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, deadline: e.target.value }))
                  }
                />
              </label>
              <label>
                SLA Risk Threshold
                <input
                  type="number"
                  step="0.01"
                  min="-1"
                  max="1"
                  required
                  value={createForm.riskThreshold}
                  onChange={(e) =>
                    setCreateForm((s) => ({
                      ...s,
                      riskThreshold: Number(e.target.value),
                    }))
                  }
                />
              </label>
              <label>
                Status
                <select
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, status: e.target.value }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
            {formError ? <div className="error">{formError}</div> : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
