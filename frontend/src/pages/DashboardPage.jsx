import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersAPI, communicationsAPI, alertsAPI, projectsAPI } from '../api/api';
import { MdNotifications, MdAdd } from 'react-icons/md';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeEngagements: 0,
    goodStatus: 0,
    warningStatus: 0,
    criticalStatus: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [atRiskEngagements, setAtRiskEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [customersRes, commsRes, projectsRes, alertsRes] = await Promise.all([
        customersAPI.getAll(),
        communicationsAPI.getAll(),
        projectsAPI.getAll().catch(() => ({ data: [] })),
        alertsAPI.getCritical().catch(() => ({ data: [] })),
      ]);

      const customers = customersRes.data;
      const projects = projectsRes.data;
      
      const statusCounts = customers.reduce((acc, customer) => {
        if (customer.riskStatus === 'stable') acc.good++;
        else if (customer.riskStatus === 'warning') acc.warning++;
        else if (customer.riskStatus === 'critical') acc.critical++;
        return acc;
      }, { good: 0, warning: 0, critical: 0 });

      setStats({
        totalCustomers: customers.length,
        activeEngagements: projects.filter(p => p.status === 'active').length,
        goodStatus: statusCounts.good,
        warningStatus: statusCounts.warning,
        criticalStatus: statusCounts.critical,
      });

      const activity = commsRes.data.slice(0, 3).map((comm, idx) => ({
        id: comm._id,
        user: comm.sender || 'Unknown User',
        action: idx === 0 ? 'added a new report to' : idx === 1 ? 'updated status for' : 'added a new stakeholder to',
        project: comm.projectId?.name || 'Unknown Project',
        detail: comm.subject || 'Communication',
        time: getTimeAgo(comm.timestamp),
        avatar: comm.sender?.charAt(0).toUpperCase() || 'U',
      }));
      setRecentActivity(activity);

      const atRisk = customers
        .filter(c => c.riskStatus === 'critical' || c.riskStatus === 'warning')
        .slice(0, 2)
        .map(customer => ({
          client: customer.name,
          engagement: 'Assessment',
          type: customer.riskStatus === 'critical' ? 'High' : 'Medium',
          owner: 'John Smith',
        }));
      setAtRiskEngagements(atRisk);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '2 hours ago';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f172a]">
      <div className="p-6 border-b border-[#1e293b]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <button className="flex items-center gap-2 text-2xl text-gray-400 hover:text-primary-400 transition-colors">
            <MdNotifications />
          </button>
        </div>
        
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input flex-1 max-w-md bg-[#1e293b] border-[#334155]"
          />
          <button 
            onClick={() => navigate('/projects')}
            className="btn-primary flex items-center gap-2"
          >
            <MdAdd className="text-xl" />
            New Engagement
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] relative">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-semibold">Total Customers</h3>
              <button 
                onClick={() => navigate('/customers')}
                className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
              >
                <MdAdd />
              </button>
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalCustomers}</p>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] relative">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-semibold">Active Engagements</h3>
              <button 
                onClick={() => navigate('/projects')}
                className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
              >
                <MdAdd />
              </button>
            </div>
            <p className="text-4xl font-bold text-white">{stats.activeEngagements}</p>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] relative">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-semibold">Engagement Status</h3>
            </div>
            <div className="flex items-center justify-center my-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#2d2d44"
                    strokeWidth="20"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${(stats.goodStatus / (stats.totalCustomers || 1)) * 440} 440`}
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="20"
                    strokeDasharray={`${(stats.warningStatus / (stats.totalCustomers || 1)) * 440} 440`}
                    strokeDashoffset={`-${(stats.goodStatus / (stats.totalCustomers || 1)) * 440}`}
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="20"
                    strokeDasharray={`${(stats.criticalStatus / (stats.totalCustomers || 1)) * 440} 440`}
                    strokeDashoffset={`-${((stats.goodStatus + stats.warningStatus) / (stats.totalCustomers || 1)) * 440}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-semibold">Status</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">Good</span>
                </div>
                <p className="text-sm text-white font-medium">{stats.goodStatus} systems</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">Warning</span>
                </div>
                <p className="text-sm text-white font-medium">{stats.warningStatus} systems</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">Critical</span>
                </div>
                <p className="text-sm text-white font-medium">{stats.criticalStatus} systems</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
              <button className="text-primary-400 hover:text-primary-300 text-sm transition-colors">
                View all activity
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {activity.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm">
                        <span className="text-white font-medium">{activity.user}</span>
                        {' '}{activity.action}{' '}
                        <span className="text-primary-400">{activity.project}</span>
                        {activity.detail && `: ${activity.detail}`}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
            <h3 className="text-xl font-bold text-white mb-6">Upcoming Deadlines</h3>
            <div className="space-y-3">
              <div className="text-gray-300">
                <p className="font-medium">Quarterly Reporting Submission - Due Tomorrow</p>
              </div>
              <div className="text-gray-300">
                <p className="font-medium">MSA Renewal</p>
              </div>
              <div className="text-gray-300">
                <p className="font-medium">Project Kickoff: Phase 2 Completion</p>
              </div>
              <div className="text-gray-300">
                <p className="font-medium">Stakeholder Review Meeting</p>
              </div>
              <button className="text-primary-400 hover:text-primary-300 text-sm mt-4 transition-colors">
                View all deadlines
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
          <h3 className="text-xl font-bold text-white mb-6">At-Risk Engagements</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Engagement</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {atRiskEngagements.length > 0 ? (
                  atRiskEngagements.map((engagement, idx) => (
                    <tr key={idx} className="border-b border-[#334155]">
                      <td className="py-3 px-4 text-gray-300">{engagement.client}</td>
                      <td className="py-3 px-4 text-gray-300">{engagement.engagement}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          engagement.type === 'High' 
                            ? 'text-red-400' 
                            : 'text-yellow-400'
                        }`}>
                          {engagement.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{engagement.owner}</td>
                      <td className="py-3 px-4">
                        <button className="text-primary-400 hover:text-primary-300 text-sm transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No at-risk engagements
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
