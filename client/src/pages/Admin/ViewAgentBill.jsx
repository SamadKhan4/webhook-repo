import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../api/axios";

const ViewAgentBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await axios.get(`/bills/${id}`);
        setBill(res.data);
      } catch {
        alert("❌ Failed to load agent bill");
        navigate("/admin/bills");
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [id, navigate]);

  if (loading) return <p className="p-8">Loading agent bill...</p>;
  if (!bill) return null;

  return (
    <div className="min-h-screen bg-white text-black p-6 print:p-0 print:bg-white">
      <div id="agent-bill" className="max-w-3xl mx-auto shadow-md border rounded-xl p-6 print:shadow-none print:border-none">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">Agent Commission Bill</h1>

        <p><strong>Bill ID:</strong> {bill._id}</p>
        <p><strong>Agent Name:</strong> {bill.agent?.name || "N/A"}</p>
        <p><strong>Customer Name:</strong> {bill.customer?.name || "N/A"}</p>

        <div className="my-4 text-lg font-semibold text-green-700">
          💰 Final Commission Given: ₹{(bill.agentCommission || 0).toFixed(2)}
        </div>

        <h2 className="mt-4 mb-2 font-semibold underline">Items Eligible for Commission:</h2>
        <div className="space-y-1 text-sm">
          {bill.items
            .filter(i => i.commissionApplicable || i.item?.commissionApplicable)
            .map((item, idx) => {
              const name = item.name || item.item?.name || "Unnamed";
              const qty = item.quantity || 1;
              const price = item.price || 0;
              const gst = item.gst || 0;
              const total = price * (1 + gst / 100) * qty;

              return (
                <div
                  key={idx}
                  className="flex justify-between border-b py-1 border-gray-300 text-sm"
                >
                  <span>{name} (x{qty})</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              );
            })}
        </div>

        <p className="mt-10 text-center text-xs text-gray-500 border-t pt-4">
          All rights reserved by Samad Khan
        </p>

        <div className="mt-6 flex justify-center gap-4 print:hidden">
          <button
            onClick={() => navigate("/admin/bills")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
          <button
            onClick={() => {
              window.print();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAgentBill;
