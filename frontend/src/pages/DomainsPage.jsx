import { useEffect, useState } from "react";
import api from "../api/client";

export default function DomainsPage() {
  const [domains, setDomains] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

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
            </tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
