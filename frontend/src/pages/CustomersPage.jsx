import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import SentimentBadge from "../components/SentimentBadge";

const initialForm = {
  name: "",
  priority: "normal",
  domainId: "",
  responseTime: 24,
  deadline: "",
  riskThreshold: -0.5,
};

export default function CustomersPage() {
  const { isManager } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const load = async () => {
    const [cRes, dRes] = await Promise.all([
      api.get("/customers"),
      api.get("/domains"),
    ]);
    setCustomers(cRes.data || []);
    setDomains(dRes.data || []);
  };

  useEffect(() => {
    load().catch(() => setError("Failed to load customers"));
  }, []);

  const domainLookup = useMemo(
    () => Object.fromEntries(domains.map((d) => [d._id, d.name])),
    [domains],
  );

  const onCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/customers", {
        name: form.name,
        priority: form.priority,
        domainId: form.domainId,
        sla: {
          responseTime: Number(form.responseTime),
          deadline: form.deadline,
          riskThreshold: Number(form.riskThreshold),
        },
      });
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create customer");
    }
  };

  return (
    <div className="page-shell">
      <h2>Customers</h2>

      {isManager ? (
        <section className="card">
          <h3>Create Customer + SLA</h3>
          <form className="grid-form" onSubmit={onCreate}>
            <label>
              Customer Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
            </label>
            <label>
              Priority
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((s) => ({ ...s, priority: e.target.value }))
                }
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Domain
              <select
                required
                value={form.domainId}
                onChange={(e) =>
                  setForm((s) => ({ ...s, domainId: e.target.value }))
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
                required
                value={form.responseTime}
                onChange={(e) =>
                  setForm((s) => ({ ...s, responseTime: e.target.value }))
                }
              />
            </label>
            <label>
              SLA Deadline
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) =>
                  setForm((s) => ({ ...s, deadline: e.target.value }))
                }
              />
            </label>
            <label>
              Risk Threshold
              <input
                type="number"
                step="0.01"
                min="-1"
                max="1"
                required
                value={form.riskThreshold}
                onChange={(e) =>
                  setForm((s) => ({ ...s, riskThreshold: e.target.value }))
                }
              />
            </label>
            <button type="submit">Create</button>
          </form>
          {error ? <div className="error">{error}</div> : null}
        </section>
      ) : null}

      <section className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Priority</th>
              <th>Domain</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.priority}</td>
                <td>{c.domainId?.name || domainLookup[c.domainId] || "-"}</td>
                <td>
                  <SentimentBadge
                    score={c.sentimentScore}
                    riskStatus={c.riskStatus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
