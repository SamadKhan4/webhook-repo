import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmployeeSidebar from '../../components/EmployeeSidebar';

const ViewBills = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get(`/bills?employee=${user._id}`);
        setBills(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('❌ Failed to fetch bills');
      }
    };
    if (user?._id) fetchBills();
  }, [user?._id]);

  const handleView = (id) => {
    navigate(`/employee/view-bill/${id}`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'partial-paid':
        return 'bg-yellow-100 text-yellow-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'unpaid':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="ml-64 p-6 w-full bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
        <h2 className="text-2xl font-bold mb-2">📄 My Generated Bills</h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Total: <span className="font-semibold">{bills.length}</span> bill{bills.length !== 1 && 's'}
        </p>

        {bills.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No bills generated yet.</p>
        ) : (
          <div className="overflow-x-auto rounded shadow">
            <table className="min-w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-blue-900 text-white text-left">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr
                    key={bill._id}
                    className="border-t dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <td className="py-3 px-4">{bill.customer?.name || 'N/A'}</td>
                    <td className="py-3 px-4">{bill.agent?.name || '—'}</td>
                    <td className="py-3 px-4 text-right font-medium">₹{(bill.total || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusStyle(bill.status)}`}>
                        {bill.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(bill.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleView(bill._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBills;
