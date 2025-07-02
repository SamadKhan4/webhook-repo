/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import EmployeeSidebar from '../../components/EmployeeSidebar';
import { useAuth } from '../../context/AuthContext';
import Select from 'react-select';

const CreateBill = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [maxCommission, setMaxCommission] = useState('');
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", address: "" });
const [paymentStatus, setPaymentStatus] = useState('Pending');
const [paymentMode, setPaymentMode] = useState('');
const [paidAmount, setPaidAmount] = useState('');


  const fetchItems = async ({ search = '', category = '', page = 1 }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', itemsPerPage);
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const res = await axios.get(`/items?${params.toString()}`);
      const itemsArray = res.data.items || [];

      setFilteredItems(itemsArray);
      setItems(itemsArray);
      setPages(res.data.pages || 1);
      setPage(page);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error("❌ Failed to fetch items:", err);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [c, a] = await Promise.all([
          axios.get('/customers'),
          axios.get('/agents'),
        ]);

        setCustomers(Array.isArray(c.data) ? c.data : []);
        setAgents(Array.isArray(a.data) ? a.data : []);

        await fetchItems({ page: 1 });
      } catch (err) {
        console.error("❌ Failed to fetch bill-related data", err);
        alert("❌ Could not load data. Please check your backend or network.");
      }
    };

    fetchInitialData();
  }, []);

 useEffect(() => {
  fetchItems({
    search,
    category: selectedCategory?.value || '',
    page,
  });
}, [search, selectedCategory, page]);

  useEffect(() => {
    const uniqueCategories = [...new Set(items.map(item => item.category || 'Uncategorized'))];
    setCategories(uniqueCategories.map(cat => ({ label: cat, value: cat })));
  }, [items]);

  const handleItemAdd = (item) => {
    if (selectedItems.find(i => i._id === item._id) || item.stock === 0) return;
    setSelectedItems(prev => [...prev, { ...item, quantity: 1 }]);
  };

  const handleQuantityChange = (index, qty) => {
    const newQty = Math.max(1, Math.min(Number(qty), selectedItems[index].stock));
    if (!Number.isInteger(newQty)) return;
    const updated = [...selectedItems];
    updated[index].quantity = newQty;
    setSelectedItems(updated);
  };

  const handleItemRemove = (index) => {
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!customerId || selectedItems.length === 0) {
    return alert("Please select a customer and add at least one item.");
  }

  for (let item of selectedItems) {
    if (item.quantity < 1 || item.quantity > item.stock) {
      return alert(`Invalid quantity for item: ${item.name}`);
    }
  }

  setLoading(true);
  try {
    const formattedItems = selectedItems.map((i) => ({
      item: i._id,
      price: i.price,
      gst: i.gst,
      quantity: i.quantity,
    }));

    // ✅ Total value (including GST) of commission-applicable items only
    const applicableValue = selectedItems.reduce((sum, i) => {
      if (i.commissionApplicable) {
        const priceWithGST = i.price * (1 + i.gst / 100);
        return sum + priceWithGST * i.quantity;
      }
      return sum;
    }, 0);

    // ✅ Final commission is a % of the above value
    let finalCommission = 0;
    if (agentId && maxCommission && !isNaN(Number(maxCommission))) {
      finalCommission = (Number(maxCommission) / 100) * applicableValue;
    }

    await axios.post("/bills", {
  customer: customerId,
  agent: agentId || null,
  createdBy: user?._id,
  items: formattedItems,
  agentCommission: agentId ? finalCommission : 0,
  paymentStatus,
  paymentMode: paymentStatus !== 'Pending' ? paymentMode : null,
  paidAmount: paymentStatus === 'Partial-Paid' ? Number(paidAmount) : paymentStatus === 'Paid' ? calcTotal() : 0,
});

    alert("✅ Bill created successfully");
    setSelectedItems([]);
    setCustomerId("");
    setAgentId("");
    setMaxCommission("");
  } catch (err) {
    alert(err?.response?.data?.error || "❌ Error creating bill");
  } finally {
    setLoading(false);
  }
};


  const calcSubtotal = () => selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const calcGST = () => selectedItems.reduce((gst, i) => gst + (i.price * i.quantity * i.gst) / 100, 0);
  const calcTotal = () => calcSubtotal() + calcGST();

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="ml-64 w-full p-8 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition">
        <h2 className="text-3xl font-bold mb-6 text-blue-800 dark:text-blue-300">🧾 Generate Customer Bill</h2>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div>
         <label className="block font-medium mb-1">Customer</label>
          <div className="flex gap-2 items-center">
         <   div className="flex-1">
        <Select
        value={customers.find(c => c._id === customerId) || null}
        onChange={opt => setCustomerId(opt?._id || '')}
        options={customers}
        getOptionLabel={c => `${c.name} (${c.phone})`}
        getOptionValue={c => c._id}
        placeholder="Search customer..."
        isClearable
        className="text-black dark:text-white"
        styles={{ menu: base => ({ ...base, zIndex: 99 }) }}
        />
       </div>
       <button
        onClick={() => setShowCustomerDialog(true)}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-lg"
        title="Add New Customer"
         >
         +
       </button>
       </div>
       </div>

            
            <div>
              <label className="block font-medium mb-1">Agent (Optional)</label>
              <Select
                value={agents.find(a => a._id === agentId) || null}
                onChange={opt => setAgentId(opt?._id || '')}
                options={agents}
                getOptionLabel={a => `${a.name} (${a.phone || 'N/A'})`}
                getOptionValue={a => a._id}
                placeholder="Search agent..."
                isClearable
                className="text-black dark:text-white"
                styles={{ menu: base => ({ ...base, zIndex: 99 }) }}
              />
            </div>
           {agentId && (
             <div className="sm:col-span-2">
           <label className="block font-medium mb-1">Agent Commission Percentage (%)</label>
             <input
            type="number"
           min="0"
            max="100"
              value={maxCommission}
             onChange={e => setMaxCommission(e.target.value)}
             className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
               placeholder="Enter commission % for commission-applicable items"
    />
  </div>
)}


          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="🔍 Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-1/2 p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
            />
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categories}
              placeholder="📂 Filter by category"
              isClearable
              className="w-full sm:w-1/2 text-black dark:text-white"
              styles={{ menu: base => ({ ...base, zIndex: 99 }) }}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">📦 Available Items</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map(i => (
                <div
                  key={i._id}
                  className={`rounded-xl border p-4 shadow-md transition transform hover:scale-[1.02] dark:border-gray-700 dark:bg-gray-900 ${i.stock === 0 ? 'opacity-50' : ''}`}
                >
                  <img src={`http://localhost:5000/uploads/items/${i.photo}`} alt={i.name} className="w-full h-32 object-cover rounded mb-2" />
                  <div className="space-y-1">
                    <h4 className="text-lg font-semibold">{i.name}</h4>
                    <p>₹{i.price} + GST {i.gst}%</p>
                    <p className={i.stock < 10 ? 'text-red-500' : 'text-gray-500'}>Stock: {i.stock}</p>
                    {i.commissionApplicable && <p className="text-purple-500 text-sm">Agent Commission: {i.commissionRate}%</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleItemAdd(i)}
                    disabled={i.stock === 0}
                    className="mt-2 w-full bg-blue-600 text-white py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {i.stock === 0 ? 'Out of Stock' : '➕ Add to Bill'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
  <button
    disabled={page === 1}
    onClick={() => setPage(prev => Math.max(1, prev - 1))}
    className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
  >
    ⬅ Prev
  </button>
  <span className="text-sm">
    Page {page} of {Math.ceil(totalItems / itemsPerPage)}
  </span>
  <button
    disabled={page >= Math.ceil(totalItems / itemsPerPage)}
    onClick={() => setPage(prev => prev + 1)}
    className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
  >
    Next ➡
  </button>
</div>

          <div>
            <h3 className="text-xl font-semibold mb-2">🛒 Selected Items</h3>
            <div className="space-y-3">
              {selectedItems.map((i, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 p-3 border rounded">
                  <div className="flex-1 min-w-[150px]">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-sm">₹{i.price} x {i.quantity} + GST {i.gst}%</p>
                    {i.commissionApplicable && <p className="text-xs text-purple-500">Commission: {i.commissionRate}%</p>}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={i.stock}
                    value={i.quantity}
                    onChange={e => handleQuantityChange(idx, e.target.value)}
                    className="w-20 p-1 border rounded"
                  />
                  <span className="font-semibold">₹{(i.price * i.quantity * (1 + i.gst / 100)).toFixed(2)}</span>
                  <button onClick={() => handleItemRemove(idx)} className="text-red-600 hover:underline">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-white dark:bg-gray-800 border rounded text-lg space-y-2">
            <p>Subtotal: ₹{calcSubtotal().toFixed(2)}</p>
            <p>GST: ₹{calcGST().toFixed(2)}</p>
            <p className="font-bold text-xl">Total: ₹{calcTotal().toFixed(2)}</p>
          </div>
<div className="grid sm:grid-cols-2 gap-4">
  <div>
    <label className="block font-medium mb-1">Payment Status</label>
    <select
      value={paymentStatus}
      onChange={(e) => setPaymentStatus(e.target.value)}
      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
    >
      <option value="Paid">Paid</option>
      <option value="Partial-Paid">Partial-Paid</option>
      <option value="Pending">Pending</option>
    </select>
  </div>

  {(paymentStatus === 'Paid' || paymentStatus === 'Partial-Paid') && (
    <div>
      <label className="block font-medium mb-1">Payment Mode</label>
      <select
        value={paymentMode}
        onChange={(e) => setPaymentMode(e.target.value)}
        className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="">Select Mode</option>
        <option value="Cash">Cash</option>
        <option value="UPI">UPI</option>
        <option value="Card">Card</option>
      </select>
    </div>
  )}

  {paymentStatus === 'Partial-Paid' && (
    <div className="sm:col-span-2">
      <label className="block font-medium mb-1">Amount Paid</label>
      <input
        type="number"
        min="0"
        max={calcTotal()}
        value={paidAmount}
        onChange={(e) => setPaidAmount(e.target.value)}
        className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
        placeholder="Enter partial paid amount"
      />
    </div>
  )}
</div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow-md disabled:opacity-50"
          >
            {loading ? 'Generating...' : '✅ Generate Bill'}
          </button>
        </form>
        </div>
        {showCustomerDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
      <h3 className="text-xl font-bold mb-4 text-center text-blue-700 dark:text-white">Add New Customer</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const res = await axios.post('/customers', newCustomer);
            const created = res.data;
            setCustomers(prev => [...prev, created]);
            setCustomerId(created._id);
            setShowCustomerDialog(false);
            setNewCustomer({ name: "", phone: "", address: "" });
          } catch {
            alert("❌ Failed to add customer");
          }
        }}
        className="space-y-3"
      >
        <input
          type="text"
          placeholder="Customer Name"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={newCustomer.phone}
          onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={newCustomer.address}
          onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setShowCustomerDialog(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
    
  );
};

export default CreateBill;
