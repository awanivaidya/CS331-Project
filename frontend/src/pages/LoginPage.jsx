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
    <div className="auth-page bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <form
        className="card auth-card border-slate-700/60 bg-slate-800/80 text-slate-100"
        onSubmit={onSubmit}
      >
        <h2 className="text-3xl font-semibold">Sign In</h2>
        <p className="muted text-slate-300">
          Use username or email and your password.
        </p>
        <label>
          Username or Email
          <input
            required
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((s) => ({ ...s, password: e.target.value }))
            }
          />
        </label>
        {error ? <div className="error">{error}</div> : null}
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-500"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
        <small>
          No account? <Link to="/register">Register</Link>
        </small>
      </form>
    </div>
  );
}
