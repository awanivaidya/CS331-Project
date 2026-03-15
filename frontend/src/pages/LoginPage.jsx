import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.name, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-header">
          <h1 className="auth-title">Customer Analytics</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>
        <label className="auth-label">
          Username or Email
          <input
            className="auth-input"
            required
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="you@example.com"
          />
        </label>
        <label className="auth-label">
          Password
          <input
            className="auth-input"
            required
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((s) => ({ ...s, password: e.target.value }))
            }
            placeholder="••••••••"
          />
        </label>
        {error ? <div className="auth-message auth-message-error">{error}</div> : null}
        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <small className="auth-footnote">
          No account? <Link to="/register">Register</Link>
        </small>
      </form>
    </div>
  );
}
