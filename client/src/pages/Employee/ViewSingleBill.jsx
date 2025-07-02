import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';

const ViewSingleBill = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await axios.get(`/bills/${id}`);
        setBill(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch bill:', err);
      }
    };
    fetchBill();
  }, [id]);

  if (!bill) {
    return (
      <div className="p-6 text-center text-lg font-semibold text-gray-600 dark:text-gray-300">
        🔄 Loading Bill...
      </div>
    );
  }

  const isPartial = bill.status === 'partial-paid';
  const pendingAmount = isPartial ? (bill.total - bill.paidAmount).toFixed(2) : 0;

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white min-h-screen font-sans print:bg-white print:text-black print:p-0 print:m-0 print:min-h-fit">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-6 mb-8 print:border-none">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400">Khan'smart</h1>
          <p className="text-sm">Shop Address, City, Pincode</p>
          <p className="text-sm">📞 9999999999 &nbsp;&nbsp; | &nbsp;&nbsp; GST: GST123456789</p>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-2xl font-bold mb-1">INVOICE</h2>
          <p className="text-sm">🗓 Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
          <p className="text-sm">
            🧾 Status:{" "}
            <span className={`capitalize font-semibold ${
              bill.status === 'paid'
                ? 'text-green-600'
                : bill.status === 'partial-paid'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {bill.status}
            </span>
          </p>
          <p className="text-sm">
            💳 Payment Mode:{" "}
            <span className="capitalize font-medium">
              {bill.paymentMode || 'N/A'}
            </span>
          </p>
          {isPartial && (
            <>
              <p className="text-sm">✅ Paid Amount: ₹{bill.paidAmount?.toFixed(2)}</p>
              <p className="text-sm">❌ Pending: ₹{pendingAmount}</p>
            </>
          )}
        </div>
      </div>

      {/* Customer & Employee Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm print:shadow-none">
          <h3 className="font-semibold text-lg mb-2 border-b pb-1">👤 Customer Info</h3>
          <p><strong>Name:</strong> {bill.customer?.name || 'N/A'}</p>
          <p><strong>Phone:</strong> {bill.customer?.phone || 'N/A'}</p>
          <p><strong>Address:</strong> {bill.customer?.address || 'N/A'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm print:shadow-none">
          <h3 className="font-semibold text-lg mb-2 border-b pb-1">🧑‍💼 Billed By</h3>
          <p><strong>Employee:</strong> {bill.createdBy?.name || 'N/A'}</p>
          <p><strong>Agent:</strong> {bill.agent?.name || 'N/A'}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto mb-8 rounded shadow print:shadow-none print:border print:rounded-none">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 print:border-collapse">
          <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="p-3 border text-left">Item</th>
              <th className="p-3 border text-center">Qty</th>
              <th className="p-3 border text-right">Price</th>
              <th className="p-3 border text-right">GST%</th>
              <th className="p-3 border text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, i) => {
              const name = item.item?.name || 'Unnamed Item';
              const qty = item.quantity || 0;
              const price = item.price || 0;
              const gst = item.gst ?? item.item?.gst ?? 0;
              const total = price * qty + (price * qty * gst) / 100;

              return (
                <tr key={i} className="border-t dark:border-gray-700">
                  <td className="p-3 border">{name}</td>
                  <td className="p-3 border text-center">{qty}</td>
                  <td className="p-3 border text-right">₹{price.toFixed(2)}</td>
                  <td className="p-3 border text-right">{gst}%</td>
                  <td className="p-3 border text-right font-medium">₹{total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10 print:mb-2">
        <div className="w-full sm:w-1/3 bg-white dark:bg-gray-800 p-4 rounded shadow text-sm space-y-2 print:border print:rounded-none print:shadow-none">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{(bill.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST</span>
            <span>₹{(bill.gst || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>₹{(bill.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600 dark:text-gray-400 print:hidden">
        <p>All rights reserved by Samad Khan</p>
        <div className="flex gap-3 mt-3 sm:mt-0">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-black dark:text-white text-sm px-4 py-2 rounded shadow"
          >
            ← Go Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow"
          >
            🖨️ Print / Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSingleBill;
