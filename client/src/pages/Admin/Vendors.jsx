import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get('/vendors');
      setVendors(res.data);
    } catch (err) {
      alert('Failed to fetch vendors');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/vendors', form);
      alert('Vendor added successfully');
      setForm({ name: '', phone: '', email: '' });
      fetchVendors();
    } catch {
      alert('Failed to add vendor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await axios.delete(`/vendors/${id}`);
      fetchVendors();
    } catch {
      alert('Failed to delete vendor');
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
        <h2 className="text-2xl font-bold mb-6">Vendor Management</h2>

        {/* Add Vendor Form */}
        <form
          onSubmit={handleAddVendor}
          className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-8 max-w-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Add New Vendor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Vendor Name"
              required
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Vendor
          </button>
        </form>

        {/* Vendor List */}
        {vendors.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No vendors available.</p>
        ) : (
          vendors.map((vendor) => (
            <div
              key={vendor._id}
              className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-400">
                  {vendor.name}
                </h3>
                <button
                  onClick={() => handleDelete(vendor._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300">📞 {vendor.phone || 'N/A'}</p>
              <p className="text-gray-700 dark:text-gray-300 mb-3">📧 {vendor.email || 'N/A'}</p>

              <h4 className="font-bold mb-2">Supplied Items:</h4>
              {vendor.items?.length > 0 ? (
                <ul className="list-disc ml-6 space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  {vendor.items.map((item) => (
                    <li key={item._id}>
                      <span className="font-medium">{item.name}</span> - ₹{item.price} | Stock:{' '}
                      {item.stock}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No items supplied yet.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Vendors;
