import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDashboard, MdPeople, MdChat, MdFolder, MdDescription, MdLogout } from 'react-icons/md';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: MdDashboard },
    { path: '/customers', label: 'Customers', icon: MdPeople },
    { path: '/communications', label: 'Communications', icon: MdChat },
    { path: '/projects', label: 'Projects', icon: MdFolder },
    { path: '/slas', label: 'SLAs', icon: MdDescription },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="w-64 bg-[#1e293b] border-r border-[#334155] h-screen flex flex-col">
      <div className="p-6 border-b border-[#334155]">
        <h1 className="text-xl font-bold text-primary-400">Customer Analytics</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                isActive(item.path)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-[#334155]'
              }`}
            >
              <Icon className={`text-xl transition-colors ${
                isActive(item.path) ? 'text-white' : 'group-hover:text-primary-400'
              }`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#334155]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#334155] transition-all group"
        >
          <MdLogout className="text-xl group-hover:text-primary-400 transition-colors" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
