import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL);

export default function UserOrders() {
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/user/${userId}`
      );
      if (res.data.success) {
        setOrders(res.data.orders);
        setSearched(true);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Listen for Realtime Status Updates
  useEffect(() => {
    socket.on("orderUpdated", (data) => {
      console.log("📦 Realtime update received:", data);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data.orderId ? { ...order, status: data.status } : order
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-10 text-center">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        🔍 Find My Orders
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 flex justify-center items-center"
      >
        <input
          type="text"
          placeholder="Enter your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg w-64 text-center focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          className="ml-3 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-gray-500">Loading orders...</p>}

      {searched && orders.length === 0 && !loading && (
        <p className="text-gray-600">No orders found for this User ID.</p>
      )}

      {orders.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-xl p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🧾 Your Orders ({orders.length})
          </h2>
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div
                key={order._id}
                className="py-3 flex justify-between items-center hover:bg-gray-50 px-3 rounded-lg transition"
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{order.orderId}</p>
                  <p className="text-sm text-gray-500">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : order.status === "Cancelled"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
