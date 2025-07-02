import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const AdminReturnNotifications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/return-exchange/admin/pending');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('❌ Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-white">
      {/* 🔙 Back to Dashboard */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        Return / Exchange Notifications
      </h2>

      {loading ? (
        <p className="text-sm text-gray-500">🔄 Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          ✅ No pending return/exchange requests.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-semibold">{requests.length}</span>{' '}
            pending request{requests.length > 1 ? 's' : ''}
          </p>
          <div className="grid gap-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="border rounded-xl p-4 bg-white dark:bg-gray-800 shadow hover:shadow-md cursor-pointer transition"
                onClick={() => navigate(`/admin/return-confirm/${req._id}`)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      req.type === 'return'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}
                  >
                    {req.type?.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(req.createdAt).toLocaleString()}
                  </span>
                </div>
                <p><strong>Customer:</strong> {req.customerId?.name || 'N/A'}</p>
                <p><strong>Employee:</strong> {req.createdBy?.name || 'N/A'}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReturnNotifications;
