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
          return [data.order, ...prev]; // Add new order on top
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
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Order Cancelled</span>
          </div>
        </div>
      );
    }

    return (
      <div className="py-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-green-400 transition-all duration-500"
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-green-400 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {getStatusIcon(status)}
                </div>
                <span
                  className={`text-xs mt-1.5 text-center max-w-16 ${
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            Track Your Orders
          </h1>
          <p className="text-gray-500">Enter your email to view order status</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-3"
        >
          <input
            type="email"
            placeholder="Enter your email (e.g. john@example.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-2.5 rounded-lg w-full sm:w-72 focus:outline-none focus:border-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Search Orders
          </button>
        </form>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-3">Loading orders...</p>
          </div>
        )}

        {searched && !loading && message && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{message}</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="bg-blue-50 p-4 flex justify-between items-center border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-semibold text-gray-800">
                      {order.orderId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="font-bold text-lg text-gray-800">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-5">{renderStatusTracker(order.status)}</div>

                <div className="px-5 pb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-600"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal with Blur Background */}
        {selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div
              className="absolute inset-0 backdrop-blur-sm bg-white/80"
              onClick={() => setSelectedOrder(null)}
            />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
              <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-20">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{selectedOrder.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm break-all">{selectedOrder.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Placed On</p>
                      <p className="text-sm">
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono text-sm">
                        {selectedOrder.orderId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Order Progress
                  </h3>
                  {renderStatusTracker(selectedOrder.status)}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Products</h3>
                  <div className="space-y-3">
                    {selectedOrder.products.map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {p.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{(p.price * p.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t text-right">
                    <p className="text-lg font-bold text-gray-800">
                      Total: ₹{selectedOrder.totalAmount.toLocaleString()}
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
