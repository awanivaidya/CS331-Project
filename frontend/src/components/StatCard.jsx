const StatCard = ({ title, value, icon, trend, trendValue }) => {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
