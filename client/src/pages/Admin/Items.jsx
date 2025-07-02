/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';
import { Pencil, Trash2 } from 'lucide-react';

const Items = () => {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', email: '', phone: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [commissionApplicable, setCommissionApplicable] = useState(false);
  const [commissionRate, setCommissionRate] = useState(0);
  const [form, setForm] = useState({
    name: '',
    price: '',
    gst: '',
    stock: '',
    vendor: '',
    category: '',
    photo: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
    fetchItems();
  }, []);

  const fetchItems = async (currentPage = 1, searchTerm = '') => {
    try {
      const res = await axios.get(`/items?page=${currentPage}&limit=25&search=${encodeURIComponent(searchTerm)}`);
      setItems(res.data.items);
      setFiltered(res.data.items);
      setPage(res.data.page);
      setTotalPages(res.data.pages);
    } catch {
      alert('❌ Failed to fetch items');
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await axios.get('/vendors');
      setVendors(res.data);
    } catch {
      alert('❌ Failed to fetch vendors');
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    fetchItems(1, term);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setForm(prev => ({ ...prev, photo: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddOrUpdateItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('price', form.price);
      formData.append('gst', form.gst);
      formData.append('stock', form.stock);
      formData.append('vendor', form.vendor);
      formData.append('category', form.category.trim());
      formData.append('commissionApplicable', commissionApplicable);
      formData.append('commissionRate', commissionRate);
      if (form.photo) formData.append('photo', form.photo);

      if (editingItemId) {
        await axios.put(`/items/${editingItemId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('✅ Item updated successfully!');
      } else {
        await axios.post('/items', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('✅ Item added successfully!');
      }

      setForm({ name: '', price: '', gst: '', stock: '', vendor: '', category: '', photo: null });
      setEditingItemId(null);
      setCommissionApplicable(false);
      setCommissionRate(0);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to save item!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setForm({
      name: item.name,
      price: item.price,
      gst: item.gst,
      stock: item.stock,
      vendor: item.vendor?._id || item.vendor,
      category: item.category || '',
      photo: null,
    });
    setCommissionApplicable(item.commissionApplicable || false);
    setCommissionRate(item.commissionRate || 0);
    setEditingItemId(item._id);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/items/${id}`);
      fetchItems();
    } catch {
      alert('❌ Failed to delete item');
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Item Management</h2>

        <form
          onSubmit={handleAddOrUpdateItem}
          className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-6 max-w-4xl"
          encType="multipart/form-data"
        >
          <h3 className="text-lg font-semibold mb-4">{editingItemId ? 'Edit Item' : 'Add New Item'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Item Name" value={form.name} onChange={handleChange} required className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <input type="number" name="gst" placeholder="GST %" value={form.gst} onChange={handleChange} required className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} required className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <input type="text" name="category" placeholder="Category (e.g., Electronics)" value={form.category} onChange={handleChange} required className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <input type="file" name="photo" accept="image/*" onChange={handleChange} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <div className="flex items-center gap-2">
              <select name="vendor" value={form.vendor} onChange={handleChange} required className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 w-full">
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>{v.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowVendorModal(true)}
                className="text-xl px-2 rounded bg-green-600 text-white hover:bg-green-700"
                title="Add Vendor"
              >
                +
              </button>
              <div className="mb-4">
  <label className="block font-medium mb-1">Is Commission Applicable?</label>
  <input
    type="checkbox"
    checked={commissionApplicable}
    onChange={e => setCommissionApplicable(e.target.checked)}
    className="h-4 w-4"
  />
</div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50">
            {loading ? 'Saving...' : editingItemId ? 'Update Item' : 'Add Item'}
          </button>
        </form>

       <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
  <input
    type="text"
    value={search}
    onChange={handleSearch}
    placeholder="Search item, vendor or category..."
    className="p-2 border rounded w-full sm:max-w-md bg-white dark:bg-gray-800 dark:border-gray-600"
  />

  <div className="flex items-center gap-2 flex-wrap">
    <button
      disabled={page === 1}
      onClick={() => fetchItems(page - 1, search)}
      className="px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded text-sm disabled:opacity-50"
    >
      ← Prev
    </button>

    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        onClick={() => fetchItems(i + 1, search)}
        className={`px-3 py-1 rounded text-sm ${
          i + 1 === page
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={page === totalPages}
      onClick={() => fetchItems(page + 1, search)}
      className="px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded text-sm disabled:opacity-50"
    >
      Next →
    </button>
  </div>
</div>

        <div className="overflow-auto rounded shadow">
          <table className="min-w-full bg-white dark:bg-gray-800 text-sm">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="py-2 px-4">Item Name</th>
                <th className="py-2 px-4">Category</th>
                <th className="py-2 px-4">Vendor</th>
                <th className="py-2 px-4">Price</th>
                <th className="py-2 px-4">GST (%)</th>
                <th className="py-2 px-4">Commission</th>
                <th className="py-2 px-4">Stock</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4">{item.category || 'Uncategorized'}</td>
                  <td className="py-2 px-4">{item.vendor?.name || 'N/A'}</td>
                  <td className="py-2 px-4">₹{item.price.toFixed(2)}</td>
                  <td className="py-2 px-4">{item.gst}%</td>
                  <td className="py-2 px-4">
  {item.commissionApplicable && <p className="text-purple-500">Commission Applicable</p>}

</td>
                  <td className={`py-2 px-4 font-semibold ${item.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>{item.stock}</td>
                  <td className="py-2 px-4 flex gap-2 items-center">
                    <button onClick={() => handleEditItem(item)} className="text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
                    <button onClick={() => handleDeleteItem(item._id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showVendorModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg relative">
              <h3 className="text-lg font-semibold mb-4">Create New Vendor</h3>
              <input type="text" placeholder="Name" value={newVendor.name} onChange={e => setNewVendor(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border mb-3 rounded dark:bg-gray-700 dark:border-gray-600" />
              <input type="email" placeholder="Email" value={newVendor.email} onChange={e => setNewVendor(prev => ({ ...prev, email: e.target.value }))} className="w-full p-2 border mb-3 rounded dark:bg-gray-700 dark:border-gray-600" />
              <input type="text" placeholder="Phone" value={newVendor.phone} onChange={e => setNewVendor(prev => ({ ...prev, phone: e.target.value }))} className="w-full p-2 border mb-3 rounded dark:bg-gray-700 dark:border-gray-600" />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowVendorModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
                <button
                  onClick={async () => {
                    try {
                      const res = await axios.post('/vendors', newVendor);
                      await fetchVendors();
                      setForm(prev => ({ ...prev, vendor: res.data._id }));
                      setNewVendor({ name: '', email: '', phone: '' });
                      setShowVendorModal(false);
                    } catch {
                      alert('❌ Failed to create vendor');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Items;
