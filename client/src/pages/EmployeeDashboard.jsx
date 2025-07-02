import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { Bell } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get('/bills');
        const myBills = res.data.filter(bill => bill.createdBy._id === user._id);
        setBills(myBills);
      } catch (err) {
        console.error('❌ Failed to load bills:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchBills();
    }
  }, [user]);

  const totalSales = bills.reduce((sum, bill) => sum + bill.total, 0);

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="ml-64 p-8 w-full min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white transition duration-300">

        {/* Header with Bell Icon */}
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 dark:text-blue-300 mb-2">Welcome, {user?.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Here’s your performance summary</p>
          </div>

          {/* 🔔 Notification Bell */}
          <Link
            to="/employee/notifications"
            className="relative group"
            title="View Notifications"
          >
            <Bell className="w-7 h-7 text-blue-600 dark:text-blue-300 hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 group-hover:scale-105 transition-transform">
              !
            </span>
          </Link>
        </header>

        {/* Stats Section */}
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-lg mt-10">Loading data...</div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard label="🧾 Total Bills" value={bills.length} color="text-blue-600 dark:text-blue-300" />
            <StatCard label="💰 Total Sales" value={`₹${totalSales.toFixed(2)}`} color="text-green-600 dark:text-green-300" />
          </section>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</h3>
    <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
  </div>
);

export default EmployeeDashboard;
