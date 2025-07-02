/* eslint-disable react/jsx-no-undef */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  UserPlus,
  FileText,
  UserCog,
  LogOut,
  History
} from 'lucide-react';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, to: '/admin' },
    { label: 'Customers', icon: <Users size={18} />, to: '/admin/customers' },
    { label: 'Items', icon: <Package size={18} />, to: '/admin/items' },
    { label: 'Vendors', icon: <Truck size={18} />, to: '/admin/vendors' },
    { label: 'Agents', icon: <UserPlus size={18} />, to: '/admin/agents' },
    { label: 'Bills', icon: <FileText size={18} />, to: '/admin/bills' },
    { label: 'Manage Employees', icon: <UserCog size={18} />, to: '/admin/employees' },
    { label: 'Return/Exchange History', icon: <History size={18} />, to: '/admin/return-history' },
  ];

  return (
    <div className="w-64 h-screen bg-blue-900 text-white fixed flex flex-col justify-between">
      <div>
        {/* Sidebar Header */}
        <div className="text-center py-5 font-extrabold text-2xl border-b border-blue-700 tracking-wider">
          Khan'smart Admin
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                ${
                  location.pathname === item.to
                    ? 'bg-blue-700'
                    : 'hover:bg-blue-800 hover:pl-4'
                }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
