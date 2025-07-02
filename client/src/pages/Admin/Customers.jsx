import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';
import { Eye, Trash2 } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBills, setCustomerBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/customers');
      setCustomers(res.data);
      setFiltered(res.data);
    } catch {
      alert('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    const result = customers.filter((c) =>
      c.name.toLowerCase().includes(keyword) || c.phone.includes(keyword)
    );
    setFiltered(result);
  };

  const handleViewDetails = async (customer) => {
    if (selectedCustomer && selectedCustomer._id === customer._id) {
      setSelectedCustomer(null);
      return;
    }
    try {
      const res = await axios.get(`/customers/${customer._id}/bills`);
      setSelectedCustomer(customer);
      setCustomerBills(res.data);
    } catch {
      alert('Failed to load customer bills');
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/customers', form);
      alert('Customer added');
      setForm({ name: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axios.delete(`/customers/${id}`);
      alert('Customer deleted');
      fetchCustomers();
      if (selectedCustomer?._id === id) setSelectedCustomer(null);
    } catch {
      alert('Failed to delete customer');
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Customer Management</h2>

        <form onSubmit={handleAddCustomer} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6 space-y-3 max-w-md">
          <h3 className="text-lg font-semibold">Add New Customer</h3>
          <input type="text" name="name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
          <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
          <input type="text" name="address" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded shadow transition-transform transform hover:scale-105" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Customer'}
          </button>
        </form>

        <input type="text" placeholder="Search by name or phone..." value={search} onChange={handleSearch} className="mb-4 p-2 border rounded w-full max-w-md bg-white dark:bg-gray-800 dark:border-gray-700" />

        {loading ? (
          <p>Loading customers...</p>
        ) : (
          <>
            <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow mb-6 border dark:border-gray-700">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Phone</th>
                  <th className="py-2 px-4 text-left">Address</th>
                  <th className="py-2 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-b dark:border-gray-700">
                    <td className="py-2 px-4">{c.name}</td>
                    <td className="py-2 px-4">{c.phone}</td>
                    <td className="py-2 px-4">{c.address}</td>
                    <td className="py-2 px-4 flex gap-2 items-center">
                      <button onClick={() => handleViewDetails(c)} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-transform transform hover:scale-105">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded shadow transition-transform transform hover:scale-105">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedCustomer && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border dark:border-gray-700">
                <h3 className="text-xl font-bold mb-3">
                  Bills for {selectedCustomer.name}
                </h3>

                {customerBills.length === 0 ? (
                  <p className="text-gray-500">No bills available.</p>
                ) : (
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-700">
                        <th className="py-1 px-2 text-left">Amount</th>
                        <th className="py-1 px-2 text-left">Status</th>
                        <th className="py-1 px-2 text-left">Agent</th>
                        <th className="py-1 px-2 text-left">Created By</th>
                        <th className="py-1 px-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerBills.map((bill) => (
                        <tr key={bill._id} className="border-b dark:border-gray-600">
                          <td className="py-1 px-2">₹{bill.total.toFixed(2)}</td>
                          <td className="py-1 px-2 capitalize">{bill.status}</td>
                          <td className="py-1 px-2">{bill.agent?.name || 'N/A'}</td>
                          <td className="py-1 px-2">{bill.createdBy.name}</td>
                          <td className="py-1 px-2">{new Date(bill.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Customers;