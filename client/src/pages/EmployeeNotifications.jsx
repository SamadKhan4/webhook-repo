/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Adjust based on your project
import { useNavigate } from 'react-router-dom';

const EmployeeNotifications = () => {
  const { user } = useAuth(); // Get employee info
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      fetchEmployeeRequests();
    }
  }, [user]);

  const fetchEmployeeRequests = async () => {
    try {
      const res = await axios.get(`/api/return-exchange/employee/${user._id}`);
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateBill = (req) => {
    // Route to generate bill from exchange request
    navigate(`/employee/generate-bill/${req._id}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Responses</h2>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No return/exchange requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white shadow rounded-xl p-4 border">
              <p><strong>Type:</strong> {req.type.toUpperCase()}</p>
              <p><strong>Customer:</strong> {req.customerId?.name}</p>
              <p><strong>Status:</strong> 
                <span className={
                  req.status === 'approved' ? 'text-green-600 font-semibold' :
                  req.status === 'rejected' ? 'text-red-600 font-semibold' :
                  'text-yellow-600'
                }>
                  {' ' + req.status.toUpperCase()}
                </span>
              </p>
              {req.adminResponse?.note && (
                <p><strong>Admin Note:</strong> {req.adminResponse.note}</p>
              )}
              {req.status === 'approved' && req.type === 'exchange' && (
                <button
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md"
                  onClick={() => generateBill(req)}
                >
                  Generate New Bill
                </button>
              )}
              {req.status === 'approved' && req.type === 'return' && (
                <p className="mt-2 text-green-700">Approved for return. Process refund.</p>
              )}
              {req.status === 'rejected' && (
                <p className="mt-2 text-red-600">Request was rejected by admin.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeNotifications;
