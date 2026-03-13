import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RiskAlertBanner from "./RiskAlertBanner";

export default function Layout() {
  const { user, isManager, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Service Pulse</h1>
        <p className="muted">AI Communication & Risk Hub</p>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/customers">Customers</NavLink>
          <NavLink to="/alerts">Risk Alerts</NavLink>
          {isManager ? <NavLink to="/domains">Domains</NavLink> : null}
        </nav>
        <div className="profile-box">
          <div>{user?.fullname || user?.username}</div>
          <small>{user?.type || user?.role}</small>
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="content">
        <RiskAlertBanner />
        <Outlet />
      </main>
    </div>
  );
}
