import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import { customersAPI } from '../api/api';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', priority: 'normal' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await customersAPI.create(formData);
      setShowModal(false);
      setFormData({ name: '', priority: 'normal' });
      fetchCustomers();
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await customersAPI.delete(id);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'priority', label: 'Priority', render: (val) => (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        val === 'high' ? 'bg-red-500/20 text-red-400' :
        val === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-green-500/20 text-green-400'
      }`}>
        {val?.toUpperCase() || 'NORMAL'}
      </span>
    )},
    { key: 'sentimentScore', label: 'Sentiment', render: (val) => val?.toFixed(2) || '0.00' },
    { key: 'riskStatus', label: 'Risk Status', render: (val) => val || 'N/A' },
    { key: 'createdAt', label: 'Created', render: (val) => new Date(val).toLocaleDateString() },
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
      <Topbar title="Customers" />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">All Customers</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Add Customer
          </button>
        </div>

        <div className="card">
          <Table 
            columns={columns} 
            data={customers}
            onRowClick={(row) => navigate(`/customers/${row._id}`)}
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
            <h3 className="text-xl font-bold text-white mb-6">Add New Customer</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer Name
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
                  Priority
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

export default CustomersPage;
