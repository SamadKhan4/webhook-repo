/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { Eye, FileSearch, Trash2, CheckCircle, Clock } from "lucide-react";

const AdminBills = () => {
  const [bills, setBills] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterEmp, setFilterEmp] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchBills = async () => {
    setLoading(true);
    try {
      let url = "/bills";
      const params = [];
      if (filterEmp) params.push(`employee=${filterEmp}`);
      if (filterStatus) params.push(`status=${filterStatus}`);
      if (params.length) url += "?" + params.join("&");
      const res = await axios.get(url);
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBills(sorted);
    } catch (err) {
      console.error("❌ Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/users/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch employees");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/bills/${id}/status`, { status });
      fetchBills();
    } catch (err) {
      alert("❌ Failed to update status");
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      await axios.delete(`/bills/${id}`);
      fetchBills();
    } catch (err) {
      alert("❌ Failed to delete bill");
    }
  };

  const viewAgentBill = (id) => {
    navigate(`/admin/view-agent-bill/${id}`);
  };

  useEffect(() => {
    fetchBills();
    fetchEmployees();
  }, []);

  return (
    <div className="flex">
  <AdminSidebar />
  <div className="ml-64 p-6 w-full bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
    <h2 className="text-2xl font-bold mb-6">📜 Manage Bills</h2>

    {/* Filters */}
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <select
        value={filterEmp}
        onChange={(e) => setFilterEmp(e.target.value)}
        className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="">Filter by Employee</option>
        {employees.map((emp) => (
          <option key={emp._id} value={emp._id}>
            {emp.name}
          </option>
        ))}
      </select>

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="">Filter by Status</option>
        <option value="paid">Paid</option>
        <option value="partial-paid">Partial-Paid</option>
        <option value="pending">Pending</option>
      </select>

      <button
        onClick={fetchBills}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-transform transform hover:scale-105"
      >
        Apply Filters
      </button>
    </div>

    {/* Bills List */}
    {loading ? (
      <p className="text-center font-medium">🔄 Loading bills...</p>
    ) : bills.length === 0 ? (
      <p className="text-center text-red-500 font-medium">🚫 No bills found.</p>
    ) : (
      <div className="grid gap-4">
        {bills.map((bill) => {
          const isPartial = bill.status === "partial-paid";
          const pendingAmount = isPartial ? (bill.total - bill.paidAmount).toFixed(2) : 0;

          return (
            <div
              key={bill._id}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700"
            >
              {/* Header */}
              <div className="flex justify-between flex-wrap gap-4">
                <div>
                  <p className="font-medium text-sm text-gray-500">
                    ID: {bill._id.slice(-6)}
                  </p>
                  <p><strong>Customer:</strong> {bill.customer?.name}</p>
                  <p><strong>Created By:</strong> {bill.createdBy?.name}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        bill.status === "paid"
                          ? "text-green-600"
                          : bill.status === "partial-paid"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {bill.status.toUpperCase()}
                    </span>
                  </p>
                  {bill.paymentMode && (
                    <p>
                      <strong>Payment Mode:</strong>{" "}
                      <span className="capitalize">{bill.paymentMode}</span>
                    </p>
                  )}
                  {isPartial && (
                    <>
                      <p><strong>Paid:</strong> ₹{bill.paidAmount}</p>
                      <p><strong>Pending:</strong> ₹{pendingAmount}</p>
                    </>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      bill.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : bill.status === "partial-paid"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {bill.status.toUpperCase()}
                  </span>

                  <button
                    onClick={() =>
                      updateStatus(
                        bill._id,
                        bill.status === "paid" ? "pending" : "paid"
                      )
                    }
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                  >
                    Mark as {bill.status === "paid" ? "Pending" : "Paid"}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-4 items-center">
                <button
                  onClick={() => navigate(`/admin/view-bill/${bill._id}`)}
                  className="p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 rounded-full"
                  title="View Customer Bill"
                >
                  <Eye size={18} />
                </button>

                {bill.agent && (
                  <button
                    onClick={() => viewAgentBill(bill._id)}
                    className="p-2 bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 text-purple-700 dark:text-purple-300 rounded-full"
                    title="View Agent Bill"
                  >
                    <FileSearch size={18} />
                  </button>
                )}

                <button
                  onClick={() => deleteBill(bill._id)}
                  className="p-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-300 rounded-full"
                  title="Delete Bill"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Exchange History */}
              {bill.exchangeHistory?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Exchange History:</h4>
                  <ul className="text-sm pl-4 list-disc">
                    {bill.exchangeHistory.map((e, i) => (
                      <li key={i}>
                        Replaced <strong>{e.originalItem.name}</strong> with{" "}
                        <strong>{e.newItem.name}</strong> on{" "}
                        {new Date(e.date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
</div>

  );
};

export default AdminBills;
