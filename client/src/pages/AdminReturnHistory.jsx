import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

const AdminReturnHistory = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFiltered(history);
    } else {
      const term = searchTerm.toLowerCase();
      const results = history.filter(h =>
        h.customerId?.name?.toLowerCase().includes(term) ||
        h.createdBy?.name?.toLowerCase().includes(term)
      );
      setFiltered(results);
    }
  }, [searchTerm, history]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/return-exchange/admin/history');
      setHistory(res.data.history);
      setFiltered(res.data.history);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Return / Exchange History</h2>

        <input
          type="text"
          className="border p-2 rounded w-full mb-4 dark:bg-gray-800 dark:border-gray-600"
          placeholder="Search by customer or employee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No history found.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((entry) => (
              <div
                key={entry._id}
                className="border p-4 rounded-xl bg-white dark:bg-gray-800 shadow dark:border-gray-700"
              >
                <p><strong>Type:</strong> {entry.type.toUpperCase()}</p>
                <p><strong>Customer:</strong> {entry.customerId?.name}</p>
                <p><strong>Employee:</strong> {entry.createdBy?.name}</p>
                <p><strong>Status:</strong> {entry.status}</p>
                {entry.adminResponse?.note && (
                  <p><strong>Admin Note:</strong> {entry.adminResponse.note}</p>
                )}
                <p><strong>Date:</strong> {new Date(entry.createdAt).toLocaleString()}</p>
                <p className="mt-2 text-sm text-blue-600 underline cursor-pointer">
                  View Full Bill Details (Coming Soon)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReturnHistory;
