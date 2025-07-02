import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  UserCircle,
  FileText,
  LogOut,
  RefreshCw
} from 'lucide-react';

const EmployeeSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      label: 'Dashboard',
      to: '/employee',
      icon: <LayoutDashboard size={18} />
    },
    {
      label: 'Create Bill',
      to: '/employee/create-bill',
      icon: <FilePlus size={18} />
    },
    {
      label: 'Profile',
      to: '/employee/profile',
      icon: <UserCircle size={18} />
    },
    {
      label: 'View My Bills',
      to: '/employee/view-bills',
      icon: <FileText size={18} />
    },
    {
      label: 'Return / Exchange',
      to: '/employee/return-exchange',
      icon: <RefreshCw size={18} />
    }
  ];

  return (
    <div className="fixed h-full w-64 bg-teal-800 text-white flex flex-col justify-between">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-center py-5 border-b border-teal-700">
          Employee Panel
        </h2>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                ${
                  location.pathname === item.to
                    ? 'bg-teal-700'
                    : 'hover:bg-teal-600 hover:pl-4'
                }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4">
        <Link
          to="/login"
          className="flex items-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          <LogOut size={18} />
          Logout
        </Link>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
