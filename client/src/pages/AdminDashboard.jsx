/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import {
  Users,
  FileText,
  FileClock,
  DollarSign,
  UserCog,
  Bell
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    customers: 0,
    employees: 0,
    orders: 0,
    bills: 0,
    totalSales: 0,
    pendingBills: 0,
  });

  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch stats', err);
      }
    };

    const checkNotifications = async () => {
      try {
        const res = await axios.get('/return-exchange/admin/pending');
        setHasNotifications(Array.isArray(res.data.requests) && res.data.requests.length > 0);
      } catch (err) {
        console.error('❌ Failed to check notifications', err);
      }
    };

    fetchDashboardStats();
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="ml-64 w-full p-6 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold">Welcome, Admin</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">
              Hello, {user?.name || 'Admin'} 👋
            </p>
          </div>

          {/* Notification Bell with Red Dot */}
          <Link
            to="/admin/return-notifications"
            className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            title="Return/Exchange Notifications"
          >
            <Bell className="w-6 h-6 text-blue-600" />
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
            )}
          </Link>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            icon={<Users className="w-6 h-6 text-blue-600" />}
            label="Total Customers"
            value={stats.customers}
            color="bg-blue-100 dark:bg-blue-900"
          />
          <DashboardCard
            icon={<UserCog className="w-6 h-6 text-green-600" />}
            label="Total Employees"
            value={stats.employees}
            color="bg-green-100 dark:bg-green-900"
          />
          <DashboardCard
            icon={<FileText className="w-6 h-6 text-purple-600" />}
            label="Total Bills"
            value={stats.bills}
            color="bg-purple-100 dark:bg-purple-900"
          />
          <DashboardCard
            icon={<DollarSign className="w-6 h-6 text-pink-600" />}
            label="Total Sales"
            value={`₹${stats.totalSales?.toFixed(2)}`}
            color="bg-pink-100 dark:bg-pink-900"
          />
          <DashboardCard
            icon={<FileClock className="w-6 h-6 text-red-600" />}
            label="Pending Bills"
            value={stats.pendingBills}
            color="bg-red-100 dark:bg-red-900"
          />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ label, value, icon, color }) => (
  <div
    className={`flex items-center gap-4 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 ${color}`}
  >
    <div className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-inner">
      {icon}
    </div>
    <div>
      <h2 className="text-md font-medium">{label}</h2>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
