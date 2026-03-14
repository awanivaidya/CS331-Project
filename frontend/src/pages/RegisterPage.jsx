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
    <div className="auth-page bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <form
        className="card auth-card border-slate-700/60 bg-slate-800/80 text-slate-100"
        onSubmit={onSubmit}
      >
        <h2 className="text-3xl font-semibold">Create Account</h2>
        <label>
          Username
          <input
            required
            value={form.username}
            onChange={(e) =>
              setForm((s) => ({ ...s, username: e.target.value }))
            }
          />
        </label>
        <label>
          Full Name
          <input
            required
            value={form.fullname}
            onChange={(e) =>
              setForm((s) => ({ ...s, fullname: e.target.value }))
            }
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) =>
              setForm((s) => ({ ...s, password: e.target.value }))
            }
          />
        </label>
        <label>
          User Type
          <select
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

        {error ? <div className="error">{error}</div> : null}
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-500"
        >
          {loading ? "Creating..." : "Register"}
        </button>
        <small>
          Already have an account? <Link to="/login">Login</Link>
        </small>
      </form>
    </div>
  );
}
