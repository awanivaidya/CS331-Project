import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import { slasAPI } from '../api/api';

const SLAPage = () => {
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSLA, setEditingSLA] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    responseTime: 24,
    resolutionTime: 72,
    priority: 'normal',
  });

  useEffect(() => {
    fetchSLAs();
  }, []);

  const fetchSLAs = async () => {
    try {
      setLoading(true);
      const response = await slasAPI.getAll();
      setSlas(response.data);
    } catch (error) {
      console.error('Error fetching SLAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSLA) {
        await slasAPI.update(editingSLA._id, formData);
      } else {
        await slasAPI.create(formData);
      }
      setShowModal(false);
      setEditingSLA(null);
      setFormData({ name: '', responseTime: 24, resolutionTime: 72, priority: 'normal' });
      fetchSLAs();
    } catch (error) {
      console.error('Error saving SLA:', error);
      alert('Error saving SLA: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (sla) => {
    setEditingSLA(sla);
    setFormData({
      name: sla.name,
      responseTime: sla.responseTime,
      resolutionTime: sla.resolutionTime,
      priority: sla.priority,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this SLA?')) return;
    
    try {
      await slasAPI.delete(id);
      fetchSLAs();
    } catch (error) {
      console.error('Error deleting SLA:', error);
      alert('Error deleting SLA');
    }
  };

  const columns = [
    { key: 'name', label: 'SLA Name' },
    { 
      key: 'priority', 
      label: 'Priority', 
      render: (val) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          val === 'high' ? 'bg-red-500/20 text-red-400' :
          val === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {val?.toUpperCase() || 'NORMAL'}
        </span>
      )
    },
    { 
      key: 'responseTime', 
      label: 'Response Time', 
      render: (val) => `${val} hours` 
    },
    { 
      key: 'resolutionTime', 
      label: 'Resolution Time', 
      render: (val) => `${val} hours` 
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
      <Topbar title="SLA Policies" />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">All SLA Policies</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Add SLA Policy
          </button>
        </div>

        <div className="card">
          <Table 
            columns={columns} 
            data={slas}
            actions={(row) => (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  className="text-primary-400 hover:text-primary-300 text-sm mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row._id);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </>
            )}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingSLA ? 'Edit SLA Policy' : 'Add New SLA Policy'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SLA Name
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
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input w-full"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Response Time (hours)
                </label>
                <input
                  type="number"
                  value={formData.responseTime}
                  onChange={(e) => setFormData({ ...formData, responseTime: parseInt(e.target.value) })}
                  className="input w-full"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution Time (hours)
                </label>
                <input
                  type="number"
                  value={formData.resolutionTime}
                  onChange={(e) => setFormData({ ...formData, resolutionTime: parseInt(e.target.value) })}
                  className="input w-full"
                  required
                  min="1"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingSLA ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSLA(null);
                    setFormData({ name: '', responseTime: 24, resolutionTime: 72, priority: 'normal' });
                  }}
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

export default SLAPage;
