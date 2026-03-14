import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import SentimentBadge from "../components/SentimentBadge";

const initialForm = {
  name: "",
  priority: "normal",
  domainId: "",
};

export default function CustomersPage() {
  const { isManager } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    const [cRes, dRes] = await Promise.all([
      api.get("/customers"),
      api.get("/domains"),
    ]);
    setCustomers(cRes.data || []);
    setDomains(dRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => {
      setLoadError("Failed to load customers");
      setLoading(false);
    });
  }, []);

  const domainLookup = useMemo(
    () => Object.fromEntries(domains.map((d) => [d._id, d.name])),
    [domains],
  );

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const customerDomain = c.domainId?.name || domainLookup[c.domainId] || "";
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        customerDomain.toLowerCase().includes(query.toLowerCase());
      const matchesRisk =
        riskFilter === "all" || (c.riskStatus || "stable") === riskFilter;
      const customerDomainId = (c.domainId?._id || c.domainId || "").toString();
      const matchesDomain =
        domainFilter === "all" || customerDomainId === domainFilter;
      return matchesQuery && matchesRisk && matchesDomain;
    });
  }, [customers, domainLookup, query, riskFilter, domainFilter]);

  const stats = useMemo(() => {
    const critical = customers.filter(
      (c) => c.riskStatus === "critical",
    ).length;
    const warning = customers.filter((c) => c.riskStatus === "warning").length;
    const stable = customers.length - critical - warning;
    return {
      total: customers.length,
      critical,
      warning,
      stable,
    };
  }, [customers]);

  const onCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      await api.post("/customers", {
        name: form.name,
        priority: form.priority,
        domainId: form.domainId,
      });
      setForm(initialForm);
      await load();
      return true;
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create customer");
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-shell">Loading customers...</div>;

  return (
    <div className="page-shell">
      <div className="page-title-row">
        <h2>Customers</h2>
        {isManager ? (
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setForm(initialForm);
              setShowCreateModal(true);
            }}
          >
            New Customer
          </button>
        ) : null}
      </div>

      {loadError ? <div className="error">{loadError}</div> : null}

      <section className="card customer-stat-row">
        <article className="customer-stat-box">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="customer-stat-box">
          <span>Stable</span>
          <strong>{stats.stable}</strong>
        </article>
        <article className="customer-stat-box">
          <span>Warning</span>
          <strong>{stats.warning}</strong>
        </article>
        <article className="customer-stat-box">
          <span>Critical</span>
          <strong>{stats.critical}</strong>
        </article>
      </section>

      <section className="card customer-toolbar">
        <input
          className="top-search"
          placeholder="Search by customer or domain"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          <option value="all">All Risks</option>
          <option value="stable">Stable</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
        >
          <option value="all">All Domains</option>
          {domains.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </section>

      <section className="cards-grid two-col">
        {filteredCustomers.map((c) => (
          <article className="card customer-card" key={c._id}>
            <div className="section-head">
              <h3>{c.name}</h3>
              <SentimentBadge
                score={c.sentimentScore}
                riskStatus={c.riskStatus}
              />
            </div>
            <p className="muted">
              Domain: {c.domainId?.name || domainLookup[c.domainId] || "-"}
            </p>
            <p className="muted">Priority: {c.priority}</p>
            <div className="customer-footer">
              <Link to={`/customers/${c._id}`}>Open Customer</Link>
            </div>
          </article>
        ))}
        {!filteredCustomers.length ? (
          <article className="card customer-card">
            <h3>No customers found</h3>
            <p className="muted">
              Try adjusting filters or create a new customer.
            </p>
          </article>
        ) : null}
      </section>

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
              <h3>New Customer</h3>
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
                Customer Name
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
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
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create Customer"}
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
