import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { generateQr, getAllOrders } from "../services/adminService.js";

export default function OrderTable({ orders }) {
  const [orderList, setOrderList] = useState(orders || []);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await getAllOrders();
        if (res.success) setOrderList(res.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    loadOrders();
  }, []);

  const handleGenerateQR = async (orderId) => {
    try {
      setLoadingId(orderId);
      const res = await generateQr(orderId);

      if (res.success) {
        toast.success("QR Code generated & order confirmed!");

        setOrderList((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  qrCode: res.qrCode,
                  qrGeneratedByAdmin: true,
                  qrGenerated: true,
                  status: res.status || "Confirmed",
                }
              : order
          )
        );
      } else {
        toast.error(res.message || "Failed to generate QR code.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error generating QR code.");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      "Pending Admin Confirmation":
        "bg-yellow-100 text-yellow-800 border-yellow-300",
      Confirmed: "bg-teal-100 text-teal-800 border-teal-300",
      Processing: "bg-blue-100 text-blue-800 border-blue-300",
      Shipped: "bg-purple-100 text-purple-800 border-purple-300",
      Delivered: "bg-green-100 text-green-800 border-green-300",
      Cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString?.$date || dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!orderList || orderList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">
          No Orders Yet
        </h2>
        <p className="text-base sm:text-lg text-center">
          Orders will appear here once customers place them.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 md:mb-10 text-center px-2">
          📦 Admin - Customer Orders
        </h1>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {orderList.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">
                    {order.orderId}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <p className="text-sm font-medium text-gray-700">
                    {order.userName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-sm font-semibold text-indigo-700">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Items</p>
                  <p className="text-sm text-gray-700">
                    {order.products.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">QR Status</p>
                  {order.qrGeneratedByAdmin || order.qrGenerated ? (
                    <p className="text-sm text-green-600 font-semibold">
                      Generated
                    </p>
                  ) : (
                    <p className="text-sm text-orange-600 font-semibold">
                      Pending
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!(order.qrGeneratedByAdmin || order.qrGenerated) && (
                  <button
                    onClick={() => handleGenerateQR(order._id)}
                    disabled={loadingId === order._id}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
                  >
                    {loadingId === order._id ? "Generating..." : "Generate QR"}
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 bg-gray-100 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-800">
              <thead className="bg-indigo-50 text-indigo-700 uppercase text-xs tracking-widest font-semibold">
                <tr>
                  <th className="px-4 xl:px-8 py-5 text-left whitespace-nowrap">
                    Order ID
                  </th>
                  <th className="px-4 xl:px-8 py-5 text-left whitespace-nowrap">
                    Customer
                  </th>
                  <th className="px-4 xl:px-8 py-5 text-center whitespace-nowrap">
                    Items
                  </th>
                  <th className="px-4 xl:px-8 py-5 text-center whitespace-nowrap">
                    Total
                  </th>
                  <th className="px-4 xl:px-8 py-5 text-center whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 xl:px-8 py-5 text-center whitespace-nowrap">
                    QR
                  </th>
                  <th className="px-4 xl:px-8 py-5 text-center whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-200 hover:bg-indigo-50/50 transition-all duration-200"
                  >
                    <td className="px-4 xl:px-8 py-5 font-semibold text-gray-900 whitespace-nowrap">
                      {order.orderId}
                    </td>
                    <td className="px-4 xl:px-8 py-5 text-gray-700">
                      {order.userName}
                    </td>
                    <td className="px-4 xl:px-8 py-5 text-center">
                      {order.products.length}
                    </td>
                    <td className="px-4 xl:px-8 py-5 text-center font-semibold text-indigo-700 whitespace-nowrap">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 xl:px-8 py-5 text-center">
                      <span
                        className={`px-3 xl:px-4 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 xl:px-8 py-5 text-center">
                      {order.qrGeneratedByAdmin || order.qrGenerated ? (
                        <span className="text-green-600 font-semibold">
                          Generated
                        </span>
                      ) : (
                        <button
                          onClick={() => handleGenerateQR(order._id)}
                          disabled={loadingId === order._id}
                          className="bg-indigo-600 text-white px-4 xl:px-5 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition whitespace-nowrap"
                        >
                          {loadingId === order._id
                            ? "Generating..."
                            : "Generate QR"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 xl:px-8 py-5 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold transition whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50 p-3 sm:p-4 md:p-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
              {/* Modal Header - Fixed */}
              <div className="flex justify-between items-center border-b border-gray-200 p-4 sm:p-6 md:p-8 shrink-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 pr-4">
                  Order Details - {selectedOrder.orderId}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-red-600 text-2xl sm:text-3xl transition shrink"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto p-4 sm:p-6 md:p-8 flex-1">
                {/* Customer Info */}
                <div className="mb-6 sm:mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                      Customer
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">
                      {selectedOrder.userName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 break-all">
                      User ID: {selectedOrder.userId}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                      Order Status
                    </h3>
                    <span
                      className={`inline-block px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Placed on: {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Product Table/Cards */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Ordered Products
                  </h3>

                  {/* Mobile Product Cards */}
                  <div className="block sm:hidden space-y-3">
                    {selectedOrder.products.map((p, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <p className="font-semibold text-gray-900 mb-2">
                          {p.name}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Qty</p>
                            <p className="text-gray-700 font-medium">
                              {p.quantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Price</p>
                            <p className="text-gray-700">
                              ₹{p.price.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Total</p>
                            <p className="text-indigo-700 font-semibold">
                              ₹{(p.price * p.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tablet/Desktop Product Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-xl">
                      <thead className="bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-semibold">
                        <tr>
                          <th className="py-3 sm:py-4 px-3 sm:px-6 text-left border-b">
                            Product
                          </th>
                          <th className="py-3 sm:py-4 px-3 sm:px-6 text-center border-b">
                            Quantity
                          </th>
                          <th className="py-3 sm:py-4 px-3 sm:px-6 text-center border-b">
                            Price
                          </th>
                          <th className="py-3 sm:py-4 px-3 sm:px-6 text-right border-b">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.products.map((p, i) => (
                          <tr
                            key={i}
                            className="border-b hover:bg-gray-50 transition"
                          >
                            <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-700 text-sm">
                              {p.name}
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-gray-700 text-sm">
                              {p.quantity}
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-gray-700 text-sm">
                              ₹{p.price.toLocaleString()}
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-6 text-right font-semibold text-indigo-700 text-sm">
                              ₹{(p.price * p.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4 text-right">
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      Total: ₹{selectedOrder.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* QR Section */}
                {selectedOrder.qrCode && (
                  <div className="bg-indigo-50 p-4 sm:p-6 rounded-xl border border-indigo-200 text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                      Order Verification QR
                    </h3>
                    <img
                      src={selectedOrder.qrCode}
                      alt="QR Code"
                      className="w-36 h-36 sm:w-48 sm:h-48 mx-auto object-contain rounded-lg"
                    />
                    <p className="text-gray-600 text-xs sm:text-sm mt-3">
                      Scan this QR to verify order
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
