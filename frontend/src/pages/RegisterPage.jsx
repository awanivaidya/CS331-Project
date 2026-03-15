import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [domains, setDomains] = useState([]);
  const [form, setForm] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    type: "Staff",
    assignedDomains: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/domains")
      .then((res) => setDomains(res.data || []))
      .catch(() => setDomains([]));
  }, []);

  const toggleDomain = (id) => {
    setForm((prev) => {
      const has = prev.assignedDomains.includes(id);
      return {
        ...prev,
        assignedDomains: has
          ? prev.assignedDomains.filter((x) => x !== id)
          : [...prev.assignedDomains, id],
      };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-header">
          <h1 className="auth-title">Customer Analytics</h1>
          <p className="auth-subtitle">Create a new account</p>
        </div>
        <label className="auth-label">
          Username
          <input
            className="auth-input"
            required
            value={form.username}
            onChange={(e) =>
              setForm((s) => ({ ...s, username: e.target.value }))
            }
            placeholder="johndoe"
          />
        </label>
        <label className="auth-label">
          Full Name
          <input
            className="auth-input"
            required
            value={form.fullname}
            onChange={(e) =>
              setForm((s) => ({ ...s, fullname: e.target.value }))
            }
            placeholder="John Doe"
          />
        </label>
        <label className="auth-label">
          Email
          <input
            className="auth-input"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            placeholder="you@example.com"
          />
        </label>
        <label className="auth-label">
          Password
          <input
            className="auth-input"
            type="password"
            required
            value={form.password}
            onChange={(e) =>
              setForm((s) => ({ ...s, password: e.target.value }))
            }
            placeholder="••••••••"
          />
        </label>
        <label className="auth-label">
          User Type
          <select
            className="auth-input"
            value={form.type}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                type: e.target.value,
                assignedDomains: [],
              }))
            }
          >
            <option value="Staff">Staff</option>
            <option value="Manager">Manager</option>
          </select>
        </label>

        {form.type === "Staff" ? (
          <fieldset>
            <legend>Assigned Domains</legend>
            <div className="checkbox-grid">
              {domains.map((d) => (
                <label key={d._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={form.assignedDomains.includes(d._id)}
                    onChange={() => toggleDomain(d._id)}
                  />
                  {d.name}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {error ? <div className="auth-message auth-message-error">{error}</div> : null}
        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Creating..." : "Create Account"}
        </button>
        <small className="auth-footnote">
          Already have an account? <Link to="/login">Login</Link>
        </small>
      </form>
    </div>
  );
}
