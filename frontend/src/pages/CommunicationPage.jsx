import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import { communicationsAPI, customersAPI, projectsAPI, domainsAPI } from '../api/api';

const CommunicationPage = () => {
  const [communications, setCommunications] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'email',
    content: '',
    subject: '',
    sender: '',
    customerId: '',
    projectId: '',
    domainId: '',
  });
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commsRes, customersRes, projectsRes, domainsRes] = await Promise.all([
        communicationsAPI.getAll(),
        customersAPI.getAll(),
        projectsAPI.getAll(),
        domainsAPI.getAll(),
      ]);
      setCommunications(commsRes.data);
      setCustomers(customersRes.data);
      setProjects(projectsRes.data);
      setDomains(domainsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = formData.type === 'email'
        ? await communicationsAPI.uploadEmail(formData)
        : await communicationsAPI.uploadTranscript({
            ...formData,
            meetingDate: new Date().toISOString(),
            participants: [formData.sender],
          });

      setAnalysisResult(response.data);
      setShowModal(false);
      setFormData({
        type: 'email',
        content: '',
        subject: '',
        sender: '',
        customerId: '',
        projectId: '',
        domainId: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error uploading communication:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const columns = [
    { key: 'type', label: 'Type', render: (val) => val?.toUpperCase() || 'N/A' },
    { key: 'subject', label: 'Subject', render: (val) => val || 'N/A' },
    { 
      key: 'customerId', 
      label: 'Customer', 
      render: (val) => val?.name || 'N/A' 
    },
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

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Communications" />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">All Communications</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Upload Communication
          </button>
        </div>

        {analysisResult && (
          <div className="card mb-6 bg-primary-600/10 border-primary-600">
            <h4 className="text-lg font-bold text-white mb-4">Analysis Result</h4>
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="font-medium">Sentiment Score:</span>{' '}
                {analysisResult.nlpAnalysis?.sentimentScore || 'N/A'}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Category:</span>{' '}
                {analysisResult.nlpAnalysis?.sentimentCategory || 'N/A'}
              </p>
              {analysisResult.nlpAnalysis?.staffTasks && (
                <div>
                  <p className="font-medium text-white mb-2">Extracted Tasks:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {analysisResult.nlpAnalysis.staffTasks.map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => setAnalysisResult(null)}
              className="mt-4 text-primary-400 hover:text-primary-300 text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="card">
          <Table columns={columns} data={communications} />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="card w-full max-w-2xl my-8">
            <h3 className="text-xl font-bold text-white mb-6">Upload Communication</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input w-full"
                >
                  <option value="email">Email</option>
                  <option value="transcript">Transcript</option>
                </select>
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
                  Project
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="input w-full"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Domain
                </label>
                <select
                  value={formData.domainId}
                  onChange={(e) => setFormData({ ...formData, domainId: e.target.value })}
                  className="input w-full"
                  required
                >
                  <option value="">Select Domain</option>
                  {domains.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {formData.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sender
                </label>
                <input
                  type="text"
                  value={formData.sender}
                  onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input w-full h-32"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  Upload & Analyze
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

export default CommunicationPage;
