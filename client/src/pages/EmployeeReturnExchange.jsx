/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import EmployeeSidebar from "../components/EmployeeSidebar";

const EmployeeReturnExchange = () => {
  const { user } = useAuth();
  const [allBills, setAllBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [mode, setMode] = useState("return");
  const [exchangeItems, setExchangeItems] = useState([]);
  const [newItemId, setNewItemId] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [searchResult, setSearchResult] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get(`/bills`);
        setAllBills(res.data);
        setFilteredBills(res.data);
      } catch (err) {
        console.error("Failed to fetch bills:", err);
      }
    };
    fetchBills();
  }, []);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (!query) return setFilteredBills(allBills);
    const filtered = allBills.filter((bill) =>
      bill.customer?.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBills(filtered);
  };

  const toggleItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleAddExchangeItem = () => {
    if (!newItemId || newItemQty <= 0) return;
    setExchangeItems((prev) => [...prev, { itemId: newItemId, quantity: newItemQty }]);
    setNewItemId("");
    setNewItemQty(1);
    setSearchResult([]);
  };

  const searchItems = async (query) => {
    if (query.length < 2) return;
    const res = await axios.get(`/api/items/search?q=${query}`);
    setSearchResult(res.data.items);
  };

  const handleSubmit = async () => {
    if (!selectedItems.length || !selectedBill) {
      alert("Select bill and at least one item.");
      return;
    }

    const originalItems = selectedBill.items
      .filter((i) => selectedItems.includes(i.item._id))
      .map((i) => ({
        itemId: i.item._id,
        quantity: i.quantity,
      }));

    const payload = {
      type: mode,
      billId: selectedBill._id,
      customerId: selectedBill.customer._id,
      createdBy: user._id,
      originalItems,
      exchangeItems: mode === "exchange" ? exchangeItems : [],
    };

    try {
      await axios.post("/api/return-exchange/create", payload);
      alert("Request submitted to admin.");
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to send request.");
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setFilteredBills(allBills);
    setSelectedBill(null);
    setSelectedItems([]);
    setExchangeItems([]);
    setSearchResult([]);
  };

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="ml-64 p-6 w-full bg-gray-50 min-h-screen dark:bg-gray-900 text-gray-800 dark:text-white transition-all duration-300">
        <h2 className="text-2xl font-bold mb-4">Return / Exchange Request</h2>

        {/* 🔍 Search Bar */}
        <div className="mb-4">
          <label className="font-semibold">Search Customer</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by customer name..."
            className="border p-2 rounded w-full mt-1"
          />
        </div>

        {/* 📃 Filtered Bills List */}
        {filteredBills.length > 0 && !selectedBill && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
            <h3 className="font-semibold mb-2">Select Bill</h3>
            <ul className="space-y-2">
              {filteredBills.map((bill) => (
                <li
                  key={bill._id}
                  className="border p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedBill(bill)}
                >
                  <strong>Customer:</strong> {bill.customer?.name} <br />
                  <strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString()} <br />
                  <strong>Total:</strong> ₹{bill.total}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 🔁 Return/Exchange Mode */}
        {selectedBill && (
          <div className="mb-4">
            <label className="font-medium mr-4">Mode:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="return">Return</option>
              <option value="exchange">Exchange</option>
            </select>
          </div>
        )}

        {/* 📦 Bill Items Selection */}
        {selectedBill && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Bill Items</h3>
            {selectedBill.items.map((item) => (
              <label key={item.item._id} className="block mb-2">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedItems.includes(item.item._id)}
                  onChange={() => toggleItem(item.item._id)}
                />
                {item.item.name} - Qty: {item.quantity} - ₹{item.item.price}
              </label>
            ))}
          </div>
        )}

        {/* 🔁 Exchange Items */}
        {mode === "exchange" && selectedBill && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Exchange With</h3>
            <input
              type="text"
              placeholder="Search items..."
              onChange={(e) => searchItems(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            {searchResult.length > 0 && (
              <div className="mb-2 bg-gray-100 dark:bg-gray-700 rounded p-2">
                {searchResult.map((item) => (
                  <div
                    key={item._id}
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 p-1"
                    onClick={() => setNewItemId(item._id)}
                  >
                    {item.name} - ₹{item.price}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min={1}
                value={newItemQty}
                onChange={(e) => setNewItemQty(parseInt(e.target.value))}
                className="border p-2 rounded w-24"
              />
              <button
                onClick={handleAddExchangeItem}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                Add
              </button>
            </div>

            {exchangeItems.length > 0 && (
              <ul className="list-disc ml-6">
                {exchangeItems.map((i, idx) => (
                  <li key={idx}>
                    Item ID: {i.itemId} - Qty: {i.quantity}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 📩 Submit */}
        {selectedBill && (
          <button
            className="bg-blue-700 text-white px-6 py-2 rounded"
            onClick={handleSubmit}
          >
            Submit Request
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeReturnExchange;
