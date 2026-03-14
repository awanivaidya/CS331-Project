import { useAuth } from '../context/AuthContext';

const Topbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <div className="bg-dark-card border-b border-dark-border px-8 py-4 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-gray-400">Welcome back,</p>
          <p className="font-medium text-white">{user?.name || user?.email}</p>
        </div>
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
