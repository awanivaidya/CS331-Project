import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import { customersAPI, communicationsAPI } from '../api/api';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerRes, commsRes] = await Promise.all([
        customersAPI.getById(id),
        communicationsAPI.getAll({ customerId: id }),
      ]);
      setCustomer(customerRes.data);
      setCommunications(commsRes.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'type', label: 'Type', render: (val) => val?.toUpperCase() || 'N/A' },
    { key: 'subject', label: 'Subject', render: (val) => val || 'N/A' },
    { 
      key: 'sentiment', 
      label: 'Sentiment', 
      render: (val) => {
        if (!val) return 'N/A';
        const sentiment = parseFloat(val);
        const color = sentiment > 0 ? 'text-green-400' : sentiment < 0 ? 'text-red-400' : 'text-gray-400';
        return <span className={color}>{sentiment.toFixed(2)}</span>;
      }
    },
    { 
      key: 'timestamp', 
      label: 'Date', 
      render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' 
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Customer Details" />
      
      <div className="flex-1 p-8 overflow-auto">
        <button
          onClick={() => navigate('/customers')}
          className="text-primary-400 hover:text-primary-300 mb-6 flex items-center gap-2"
        >
          ← Back to Customers
        </button>

        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">{customer.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Priority</p>
              <p className="text-white font-medium">{customer.priority?.toUpperCase() || 'NORMAL'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Sentiment Score</p>
              <p className="text-white font-medium">{customer.sentimentScore?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Risk Status</p>
              <p className="text-white font-medium">{customer.riskStatus || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Created</p>
              <p className="text-white font-medium">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Communications History</h3>
          <Table columns={columns} data={communications} />
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
