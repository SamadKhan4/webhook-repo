/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GenerateExchangeBill = () => {
  const { user } = useAuth();
  const { id } = useParams(); // request ID from URL
  const [request, setRequest] = useState(null);
  const [itemsMap, setItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [extraAmount, setExtraAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('URL param id:', id);
    fetchRequest();
  }, []);

  const fetchRequest = async () => {
    try {
      const res = await axios.get(`/api/return-exchange/employee/${user._id}`);
      const allRequests = res.data.requests || [];

      console.log('Returned requests:', allRequests);

      // Try to find the request matching the URL param
      const req = allRequests.find(r => r._id === id);

      if (!req) {
        console.warn('Request not found.');
        return setLoading(false);
      }

      if (req.status !== 'approved') {
        console.warn('Request found but not approved:', req.status);
        return setLoading(false);
      }

      // Fetch unique item data
      const allItemIds = [
        ...req.originalItems.map(i => i.itemId),
        ...req.exchangeItems.map(i => i.itemId),
      ];
      const uniqueIds = [...new Set(allItemIds)];

      const itemResponses = await Promise.all(
        uniqueIds.map(iid => axios.get(`/items/${iid}`))
      );

      const itemsData = {};
      itemResponses.forEach(res => {
        itemsData[res.data._id] = res.data;
      });

      setItemsMap(itemsData);

      // Calculate price difference
      let oldTotal = 0;
      let newTotal = 0;
      req.originalItems.forEach(i => {
        oldTotal += itemsData[i.itemId].price * i.quantity;
      });
      req.exchangeItems.forEach(i => {
        newTotal += itemsData[i.itemId].price * i.quantity;
      });

      setExtraAmount(newTotal - oldTotal);
      setRequest(req);
    } catch (err) {
      console.error('Error fetching exchange request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async () => {
    try {
      const items = request.exchangeItems.map(i => ({
        item: i.itemId,
        quantity: i.quantity,
      }));

      const payload = {
        customer: request.customerId._id,
        createdBy: user._id,
        agent: null, // Optional: Fill if agent is involved
        items,
        extraAmountPaid: extraAmount > 0 ? extraAmount : 0,
        fromExchangeRequest: request._id,
      };

      const res = await axios.post('/bills', payload);
      alert('New bill created successfully');
      navigate(`/employee/bill/${res.data._id}`);
    } catch (err) {
      console.error('Error creating new bill:', err);
      alert('Failed to generate bill.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!request) return <p className="text-red-600">Invalid or unapproved request.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Exchange Bill Creation</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Old Items</h3>
        <ul className="list-disc ml-6">
          {request.originalItems.map((i, idx) => (
            <li key={idx}>
              {itemsMap[i.itemId]?.name} - Qty: {i.quantity} - ₹
              {itemsMap[i.itemId]?.price * i.quantity}
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">New Items</h3>
        <ul className="list-disc ml-6">
          {request.exchangeItems.map((i, idx) => (
            <li key={idx}>
              {itemsMap[i.itemId]?.name} - Qty: {i.quantity} - ₹
              {itemsMap[i.itemId]?.price * i.quantity}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-blue-700 font-semibold">
          {extraAmount > 0
            ? `Extra amount to be paid by customer: ₹${extraAmount}`
            : extraAmount < 0
            ? `Amount to be refunded to customer: ₹${-extraAmount}`
            : `No extra or refund needed.`}
        </p>
      </div>

      <button
        onClick={handleGenerateBill}
        className="bg-green-600 text-white px-6 py-2 rounded-md"
      >
        Generate Bill
      </button>
    </div>
  );
};

export default GenerateExchangeBill;
