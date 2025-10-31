import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

export default function ScanOrderPage() {
  const router = useRouter();
  const { token } = router.query;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
    "Returned",
    "Refunded",
    "Failed",
  ];

  useEffect(() => {
    if (!token) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/verify/${token}`
        );
        if (res.data.success) {
          setOrder(res.data.order);
        } else {
          setError(res.data.message || "Invalid QR code");
        }
      } catch (err) {
        console.error("QR verify error:", err);
        setError(err.response?.data?.message || "Invalid or expired QR code");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  const handleStatusUpdate = async (newStatus) => {
    if (!newStatus || newStatus === order.status) return;

    // Prevent update if already Delivered
    if (order.status === "Delivered") {
      toast.error("Delivered orders cannot be modified.");
      return;
    }

    try {
      setUpdating(true);
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/status/${order._id}`,
        { status: newStatus }
      );

      if (res.data.success) {
        setOrder((prev) => ({ ...prev, status: newStatus }));

        const statusIcons = {
          Shipped: "Shipped",
          "Out for Delivery": "Truck",
          Delivered: "Check",
          Cancelled: "Cross",
          Returned: "Return",
          Refunded: "Money",
          Processing: "Gear",
        };

        toast.success(
          `${
            statusIcons[newStatus] || "Update"
          } Order status updated to "${newStatus}"`,
          { duration: 3000 }
        );
      }
    } catch (err) {
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Verifying QR code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          QR Verification Failed
        </h1>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isDelivered = order.status === "Delivered";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 flex items-center justify-center">
      {/* Hot Toast Container */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-3xl border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Order Verified Successfully
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Order ID
            </h3>
            <p className="text-gray-600">{order.orderId}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Customer
            </h3>
            <p className="text-gray-600 font-medium">{order.userName}</p>
            <p className="text-sm text-gray-500 break-all mt-1">
              {order.email}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Total Amount
            </h3>
            <p className="text-gray-600 font-semibold">₹{order.totalAmount}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Status</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                order.status === "Confirmed"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : order.status === "Delivered"
                  ? "bg-teal-100 text-teal-800 border-teal-200"
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Status Update Dropdown - Disabled if Delivered */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Update Order Status
          </h3>
          <select
            className={`border rounded-lg p-2 w-full text-gray-700 focus:ring-2 focus:ring-indigo-500 transition ${
              isDelivered
                ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                : "border-gray-300 focus:border-indigo-500"
            }`}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={updating || isDelivered}
            value={order.status}
          >
            <option value={order.status} disabled>
              {order.status} (Current)
            </option>
            {statusOptions
              .filter((s) => s !== order.status)
              .map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
          </select>

          {/* Info message if Delivered */}
          {isDelivered && (
            <p className="text-xs text-gray-500 mt-2 italic">
              Delivered orders cannot be modified.
            </p>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-10 mb-3">
          Ordered Products
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-2 px-4 text-left border-b">Product</th>
                <th className="py-2 px-4 text-center border-b">Qty</th>
                <th className="py-2 px-4 text-right border-b">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 px-4">{p.name}</td>
                  <td className="py-2 px-4 text-center">{p.quantity}</td>
                  <td className="py-2 px-4 text-right">₹{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-8 flex flex-col gap-3">
          {order.qrCode && (
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = order.qrCode;
                link.download = `${order.orderId}_QRCode.png`;
                link.click();
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Download QR Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
