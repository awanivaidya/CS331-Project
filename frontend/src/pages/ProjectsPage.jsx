import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import { projectsAPI, customersAPI } from '../api/api';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    customerId: '',
    status: 'active',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, customersRes] = await Promise.all([
        projectsAPI.getAll(),
        customersAPI.getAll(),
      ]);
      setProjects(projectsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.create(formData);
      setShowModal(false);
      setFormData({ name: '', customerId: '', status: 'active', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const columns = [
    { key: 'name', label: 'Project Name' },
    { 
      key: 'customerId', 
      label: 'Customer', 
      render: (val) => val?.name || 'N/A' 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          val === 'active' ? 'bg-green-500/20 text-green-400' :
          val === 'completed' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {val?.toUpperCase() || 'ACTIVE'}
        </span>
      )
    },
    { 
      key: 'tasks', 
      label: 'Tasks', 
      render: (val) => Array.isArray(val) ? val.length : 0 
    },
    { 
      key: 'createdAt', 
      label: 'Created', 
      render: (val) => new Date(val).toLocaleDateString() 
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Projects" />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">All Projects</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Add Project
          </button>
        </div>

        <div className="card">
          <Table 
            columns={columns} 
            data={projects}
            actions={(row) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row._id);
                }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            )}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-6">Add New Project</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="input w-full"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input w-full"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full h-24"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
