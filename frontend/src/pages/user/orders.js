import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Mail,
  User,
  Calendar,
} from "lucide-react";

const socket = io(process.env.NEXT_PUBLIC_API_URL);

const ORDER_STATUSES = [
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const getStatusIcon = (status) => {
  switch (status) {
    case "Confirmed":
      return <CheckCircle className="w-4 h-4" />;
    case "Processing":
      return <Clock className="w-4 h-4" />;
    case "Shipped":
      return <Package className="w-4 h-4" />;
    case "Out for Delivery":
      return <Truck className="w-4 h-4" />;
    case "Delivered":
      return <CheckCircle className="w-4 h-4" />;
    case "Cancelled":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getStatusIndex = (status) => ORDER_STATUSES.indexOf(status);

export default function UserOrders() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setLoading(true);
      const res = await axios.get(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/orders/user/${encodeURIComponent(email.trim())}`
      );

      if (res.data.success && res.data.orders.length > 0) {
        setOrders(res.data.orders);
        setMessage("");
      } else {
        setOrders([]);
        setMessage(
          res.data.message ||
            "No orders found for this email. Please check the email and try again."
        );
      }
      setSearched(true);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
      setMessage(
        "Unable to fetch orders. Please check your email and try again."
      );
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!email) return;

    const socket = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
      }
    );

    socket.on("orderUpdated", (data) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data.orderId ? { ...order, status: data.status } : order
        )
      );

      if (selectedOrder?._id === data.orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: data.status }));
      }
    });

    socket.on("orderConfirmedForUser", (data) => {
      if (data.email === email.trim().toLowerCase()) {
        setOrders((prev) => {
          const exists = prev.some((o) => o._id === data.order._id);
          if (exists) return prev;
          return [data.order, ...prev];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [email, selectedOrder]);

  const renderStatusTracker = (currentStatus) => {
    const currentIndex = getStatusIndex(currentStatus);
    const isCancelled = currentStatus === "Cancelled";

    if (isCancelled) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Order Cancelled</span>
          </div>
        </div>
      );
    }

    return (
      <div className="py-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{
                width: `${(currentIndex / (ORDER_STATUSES.length - 1)) * 100}%`,
              }}
            />
          </div>

          {ORDER_STATUSES.map((status, index) => {
            const isCompleted = index <= currentIndex;
            return (
              <div key={status} className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    isCompleted
                      ? "bg-linear-to-br from-emerald-500 to-teal-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {getStatusIcon(status)}
                </div>
                <span
                  className={`text-xs mt-1.5 text-center max-w-16 font-medium ${
                    isCompleted ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-gray-50 to-stone-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Track Your Orders
          </h1>
          <p className="text-gray-600 text-lg">
            Enter your email to view order status
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-10 flex flex-col sm:flex-row justify-center items-center gap-3"
        >
          <input
            type="email"
            placeholder="Enter your email (e.g. john@example.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-gray-200 p-3 rounded-xl w-full sm:w-80 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-semibold"
          >
            Search Orders
          </button>
        </form>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading orders...</p>
          </div>
        )}

        {searched && !loading && message && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{message}</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-2xl border-2 border-gray-100 cursor-pointer hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden"
              >
                <div className="bg-linear-to-r from-purple-50 via-pink-50 to-rose-50 p-5 flex justify-between items-center border-b-2 border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                      Order ID
                    </p>
                    <p className="font-bold text-gray-800 text-lg">
                      {order.orderId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                      Total Amount
                    </p>
                    <p className="font-bold text-2xl bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-6">{renderStatusTracker(order.status)}</div>

                <div className="px-6 pb-5 flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-semibold">
                    Current Status:
                  </span>
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                      order.status === "Delivered"
                        ? "bg-linear-to-r from-emerald-100 to-teal-100 text-emerald-700"
                        : order.status === "Cancelled"
                        ? "bg-linear-to-r from-red-100 to-rose-100 text-red-700"
                        : "bg-linear-to-r from-purple-100 to-pink-100 text-purple-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div
              className="absolute inset-0 backdrop-blur-md bg-gray-900/20"
              onClick={() => setSelectedOrder(null)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 border-2 border-gray-100">
              <div className="flex justify-between items-center p-6 border-b-2 border-gray-100 sticky top-0 bg-linear-to-r from-purple-50 via-pink-50 to-rose-50 z-20 rounded-t-3xl">
                <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Order Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-white rounded-full p-2 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-center gap-3 bg-linear-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                        Customer
                      </p>
                      <p className="font-bold text-gray-800">
                        {selectedOrder.userName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-linear-to-br from-rose-50 to-orange-50 p-4 rounded-xl border border-rose-100">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Mail className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                        Email
                      </p>
                      <p className="text-sm break-all font-medium text-gray-700">
                        {selectedOrder.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-linear-to-br from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Calendar className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                        Placed On
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-linear-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-100">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                        Order ID
                      </p>
                      <p className="font-mono text-sm font-bold text-gray-800">
                        {selectedOrder.orderId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-gray-100 pt-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">
                    Order Progress
                  </h3>
                  {renderStatusTracker(selectedOrder.status)}
                </div>

                <div className="border-t-2 border-gray-100 pt-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">
                    Products
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.products.map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-linear-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                      >
                        <div>
                          <p className="font-bold text-gray-800">{p.name}</p>
                          <p className="text-sm text-gray-600 font-semibold mt-1">
                            Quantity: {p.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-lg bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ₹{(p.price * p.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t-2 border-gray-200 text-right bg-linear-to-r from-purple-50 to-pink-50 p-5 rounded-xl">
                    <p className="text-sm text-gray-600 font-semibold mb-1">
                      Grand Total
                    </p>
                    <p className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ₹{selectedOrder.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
