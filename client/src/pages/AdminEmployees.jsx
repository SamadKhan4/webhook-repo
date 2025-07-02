/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import { Eye, FileSearch, Trash2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [selectedEmployeeBills, setSelectedEmployeeBills] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchEmployees = async () => {
    try {
      const empRes = await axios.get('/employees');
      const billRes = await axios.get('/bills');

      const billMap = {};
      billRes.data.forEach((bill) => {
        const empId = bill.createdBy?._id;
        if (empId) {
          billMap[empId] = (billMap[empId] || 0) + 1;
        }
      });

      const employeesWithCount = empRes.data.map((emp) => ({
        ...emp,
        billCount: billMap[emp._id] || 0,
      }));

      setEmployees(employeesWithCount);
    } catch {
      alert('Failed to load employees or bills');
    }
  };

  const handleEditClick = (emp) => {
    setEditingId(emp._id);
    setEditForm({ name: emp.name, phone: emp.phone });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/employees/${editingId}`, editForm);
      setEditingId(null);
      fetchEmployees();
    } catch {
      alert('Failed to update employee');
    }
  };

  const handleDelete = async (id, email) => {
    if (email === 'admin@gmail.com') {
      alert("❌ You cannot delete the admin user!");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`/employees/${id}`);
      fetchEmployees();
    } catch {
      alert('Failed to delete employee');
    }
  };

  const handleViewBills = async (empId) => {
    try {
      const res = await axios.get(`/employees/${empId}/bills`);
      setSelectedEmployeeBills(res.data);
      setShowModal(true);
    } catch {
      alert('Failed to fetch bills for this employee');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <Link
            to="/admin/register-employee"
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded transition"
          >
            <UserPlus size={18} />
            
          </Link>
        </div>

        {employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow border dark:border-gray-700">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Phone</th>
                <th className="py-2 px-4 text-left">Bills Created</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4">
                    {editingId === emp._id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="p-1 rounded border dark:bg-gray-700 dark:border-gray-600"
                      />
                    ) : (
                      emp.name
                    )}
                  </td>
                  <td className="py-2 px-4">{emp.email}</td>
                  <td className="py-2 px-4">
                    {editingId === emp._id ? (
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="p-1 rounded border dark:bg-gray-700 dark:border-gray-600"
                      />
                    ) : (
                      emp.phone
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {emp.billCount} {emp.billCount === 1 ? 'Bill' : 'Bills'}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-3 items-center text-xl">
                    {editingId === emp._id ? (
                      <button
                        onClick={handleEditSubmit}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FileSearch size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id, emp.email)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handleViewBills(emp._id)}
                          className="text-purple-600 hover:text-purple-800"
                          title="View Bills"
                        >
                          <Eye size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Bills Created by Employee
              </h3>
              {selectedEmployeeBills.length === 0 ? (
                <p>No bills found.</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedEmployeeBills.map((bill) => (
                    <li key={bill._id} className="border-b pb-1 dark:border-gray-700">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        Bill ID: <span className="font-mono">{bill._id}</span><br />
                        Customer: <span className="font-semibold">{bill.customer?.name || 'N/A'}</span><br />
                        Amount: ₹{bill.total || 0}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-right mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmployees;
