/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AdminReturnConfirm = () => {
  const { id } = useParams(); // Request ID
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [bill, setBill] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequestDetails();
  }, []);

  const fetchRequestDetails = async () => {
    try {
      const res = await axios.get(`/api/return-exchange/admin/pending`);
      const req = res.data.requests.find(r => r._id === id);
      if (!req) return navigate('/admin/return-notifications');
      setRequest(req);

      const billRes = await axios.get(`/bills/${req.billId._id}`);
      setBill(billRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (status) => {
    try {
      await axios.put(`/api/return-exchange/admin/respond/${id}`, {
        status,
        note,
      });
      alert(`Request ${status.toUpperCase()} successfully!`);
      navigate('/admin/return-notifications');
    } catch (err) {
      console.error('Error updating:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!request || !bill) return <p>No data found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Confirm Return / Exchange</h2>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <p><strong>Type:</strong> {request.type}</p>
        <p><strong>Customer:</strong> {request.customerId?.name}</p>
        <p><strong>Employee:</strong> {request.createdBy?.name}</p>
        <p><strong>Date:</strong> {new Date(request.createdAt).toLocaleString()}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Requested Items</h3>
        <ul className="list-disc ml-5">
          {request.originalItems.map((item, index) => {
            const fullItem = bill.items.find(i => i.item._id === item.itemId);
            return (
              <li key={index}>
                {fullItem?.item.name || 'Item'} - Qty: {item.quantity}
              </li>
            );
          })}
        </ul>
        {request.type === 'exchange' && request.exchangeItems?.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mt-4">Exchange With</h3>
            <ul className="list-disc ml-5">
              {request.exchangeItems.map((item, index) => (
                <li key={index}>
                  Item ID: {item.itemId} - Qty: {item.quantity}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Admin Note</label>
        <textarea
          className="w-full border rounded-md p-2"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={() => handleResponse('approved')}
        >
          Approve
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md"
          onClick={() => handleResponse('rejected')}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default AdminReturnConfirm;
