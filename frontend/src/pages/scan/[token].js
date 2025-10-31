import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/verify/${token}`
        );
        const data = await res.json();

        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || "Invalid QR code");
        }
      } catch (err) {
        console.error("QR verify error:", err);
        setError("Invalid or expired QR code");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  const handleStatusUpdate = async (newStatus) => {
    if (!newStatus || newStatus === order.status) return;

    if (order.status === "Delivered") {
      toast.error("Delivered orders cannot be modified.");
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/status/${order._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setOrder((prev) => ({ ...prev, status: newStatus }));

        const statusIcons = {
          Shipped: "📦",
          "Out for Delivery": "🚚",
          Delivered: "✅",
          Cancelled: "❌",
          Returned: "↩️",
          Refunded: "💰",
          Processing: "⚙️",
        };

        toast.success(
          `${
            statusIcons[newStatus] || "📋"
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

  const getStatusColor = (status) => {
    const statusMap = {
      Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Processing: "bg-blue-50 text-blue-700 border-blue-200",
      Shipped: "bg-violet-50 text-violet-700 border-violet-200",
      "Out for Delivery": "bg-orange-50 text-orange-700 border-orange-200",
      Delivered: "bg-green-50 text-green-700 border-green-200",
      Cancelled: "bg-red-50 text-red-700 border-red-200",
      Returned: "bg-pink-50 text-pink-700 border-pink-200",
      Refunded: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Failed: "bg-slate-50 text-slate-700 border-slate-200",
    };
    return statusMap[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 text-lg font-semibold">
            Verifying QR code...
          </p>
          <p className="text-slate-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-6 sm:p-8 md:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-3">
            QR Verification Failed
          </h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-semibold shadow-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isDelivered = order.status === "Delivered";

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
              Order Verified
            </h1>
          </div>
          <p className="text-slate-300 text-center text-sm sm:text-base">
            QR code scanned successfully
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
          {/* Order Information */}
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Order Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Order ID */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Order ID
                </h3>
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  {order.orderId}
                </p>
              </div>

              {/* Customer Name */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Customer
                </h3>
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  {order.userName}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 break-all mt-1">
                  {order.email}
                </p>
              </div>

              {/* Total Amount */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <h3 className="text-xs sm:text-sm font-semibold text-emerald-700 mb-1 uppercase tracking-wide">
                  Total Amount
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                  ₹{order.totalAmount.toLocaleString()}
                </p>
              </div>

              {/* Current Status */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Current Status
                </h3>
                <span
                  className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 md:p-8">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Update Order Status
            </h3>

            <select
              className={`w-full border-2 rounded-xl p-3 sm:p-4 text-sm sm:text-base font-medium transition-all focus:ring-4 focus:ring-slate-200 focus:outline-none ${
                isDelivered
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed border-slate-300"
                  : "bg-white text-slate-800 border-slate-300 hover:border-slate-400 focus:border-slate-600"
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

            {isDelivered && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                <svg
                  className="w-4 h-4 text-amber-600 mt-0.5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs sm:text-sm text-amber-700 font-medium">
                  Delivered orders cannot be modified.
                </p>
              </div>
            )}

            {updating && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-xs sm:text-sm text-blue-700 font-medium">
                  Updating status...
                </p>
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="p-4 sm:p-6 md:p-8 border-t border-slate-200">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Ordered Products
            </h2>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {order.products.map((p, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                >
                  <p className="font-bold text-slate-900 mb-3">{p.name}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs font-medium mb-1">
                        Quantity
                      </p>
                      <p className="text-slate-800 font-bold">{p.quantity}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-medium mb-1">
                        Price
                      </p>
                      <p className="text-slate-800 font-bold">
                        ₹{p.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-slate-500 text-xs font-medium mb-1">
                      Total
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      ₹{(p.price * p.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="py-3 sm:py-4 px-4 sm:px-6 text-left font-bold text-xs sm:text-sm uppercase tracking-wide">
                      Product
                    </th>
                    <th className="py-3 sm:py-4 px-4 sm:px-6 text-center font-bold text-xs sm:text-sm uppercase tracking-wide">
                      Quantity
                    </th>
                    <th className="py-3 sm:py-4 px-4 sm:px-6 text-right font-bold text-xs sm:text-sm uppercase tracking-wide">
                      Price
                    </th>
                    <th className="py-3 sm:py-4 px-4 sm:px-6 text-right font-bold text-xs sm:text-sm uppercase tracking-wide">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {order.products.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-800 font-medium">
                        {p.name}
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-center text-slate-800 font-semibold">
                        {p.quantity}
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-right text-slate-800 font-semibold">
                        ₹{p.price.toLocaleString()}
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-right text-slate-900 font-bold">
                        ₹{(p.price * p.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="mt-4 sm:mt-6 bg-slate-100 border border-slate-200 rounded-xl p-4 sm:p-5 text-right">
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-1">
                Grand Total
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                ₹{order.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* QR Download Section */}
          {order.qrCode && (
            <div className="bg-emerald-50 border-t border-emerald-200 p-4 sm:p-6 md:p-8 text-center">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                QR Code
              </h3>
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = order.qrCode;
                  link.download = `${order.orderId}_QRCode.png`;
                  link.click();
                }}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all font-semibold shadow-lg text-sm sm:text-base inline-flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download QR Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
