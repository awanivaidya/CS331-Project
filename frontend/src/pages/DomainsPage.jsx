import { useEffect, useState } from "react";
import api from "../api/client";

export default function DomainsPage() {
  const [domains, setDomains] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [deletingDomainId, setDeletingDomainId] = useState(null);

  const load = async () => {
    const { data } = await api.get("/domains");
    setDomains(data || []);
  };

  useEffect(() => {
    load().catch(() => setError("Failed to load domains"));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/domains", { name });
      setName("");
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create domain");
    }
  };

  const getDeleteDomainError = (err, domainName) => {
    const status = err.response?.status;
    const backendError = String(err.response?.data?.error || "").trim();
    const normalized = backendError.toLowerCase();

    const dependencyHints = [
      "in use",
      "assigned",
      "linked",
      "referenced",
      "dependency",
      "customers",
      "projects",
      "constraint",
      "foreign key",
      "cannot delete",
      "used by",
    ];

    if (status === 409 || dependencyHints.some((hint) => normalized.includes(hint))) {
      return `Cannot delete \"${domainName}\" because it is linked to existing customers or projects. Reassign or remove those records first.`;
    }

    if (status === 404) {
      return "Domain was not found. Refresh and try again.";
    }

    return backendError || "Failed to delete domain";
  };

  const onDeleteDomain = async (domain) => {
    const confirmed = window.confirm(
      `Delete domain "${domain.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setError("");
    setDeletingDomainId(domain._id);
    try {
      await api.delete(`/domains/${domain._id}`);
      await load();
    } catch (err) {
      setError(getDeleteDomainError(err, domain.name));
    } finally {
      setDeletingDomainId(null);
    }
  };

  return (
    <div className="page-shell">
      <h2>Domain Management</h2>
      <section className="card">
        <h3>Create Domain</h3>
        <form className="inline-form" onSubmit={onSubmit}>
          <input
            required
            placeholder="Domain name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
        {error ? <div className="error">{error}</div> : null}
      </section>

      <section className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="actions-col">
                  <div className="actions-group">
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => onDeleteDomain(d)}
                      disabled={deletingDomainId === d._id}
                    >
                      {deletingDomainId === d._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
