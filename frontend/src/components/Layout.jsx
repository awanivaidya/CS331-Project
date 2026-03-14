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
    <div className="app-shell min-h-screen">
      <aside className="sidebar border-r border-slate-700/60">
        <div className="brand-row">
          <div className="brand-avatar">SP</div>
          <div>
            <h1>Service Pulse</h1>
            <p className="online-dot">Online</p>
          </div>
        </div>
        <nav className="mt-2">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/customers">Customers</NavLink>
          <NavLink to="/alerts">Risk Alerts</NavLink>
          <NavLink to="/dashboard">Reports</NavLink>
          {isManager ? <NavLink to="/domains">Settings</NavLink> : null}
        </nav>
        <div className="profile-box mt-auto">
          <div className="profile-main">
            <div className="brand-avatar small">
              {(user?.fullname || user?.username || "U")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div>{user?.fullname || user?.username}</div>
              <small>{user?.type || user?.role}</small>
            </div>
          </div>
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="content bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="content-brand">Service Pulse</div>
        <RiskAlertBanner />
        <Outlet />
      </main>
    </div>
  );
}
