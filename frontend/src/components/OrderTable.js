import { useState } from "react";
import { generateQr } from "../services/adminService";
import { toast } from "react-hot-toast";

export default function OrderTable({ orders }) {
  const [orderList, setOrderList] = useState(orders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleGenerateQR = async (orderId) => {
    try {
      setOrderList((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, loadingQR: true } : o
        )
      );

      const data = await generateQr(orderId);
      toast.success(`QR Generated for ${data.orderId}`);

      setOrderList((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, qrGeneratedByAdmin: true, qrCode: data.qrCode }
            : o
        )
      );
    } catch (err) {
      console.error("❌ QR generation failed:", err);
      toast.error("Failed to generate QR");
    } finally {
      setOrderList((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, loadingQR: false } : o
        )
      );
    }
  };

  if (!orderList.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">No orders found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Management</h1>
        
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">QR Code</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orderList.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.userName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{order.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.qrGeneratedByAdmin ? (
                        <button
                          disabled
                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                        >
                          <span>✅</span>
                          <span>Generated</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateQR(order._id)}
                          disabled={order.loadingQR}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {order.loadingQR ? "Generating..." : "Generate QR"}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.orderId}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.userName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">₹{selectedOrder.totalAmount}</p>
                </div>
              </div>

              {selectedOrder.qrCode && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">QR Code</p>
                  <img src={selectedOrder.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Additional Information</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium">Order ID (Internal):</span> {selectedOrder._id}</p>
                  <p><span className="font-medium">QR Status:</span> {selectedOrder.qrGeneratedByAdmin ? "Generated" : "Not Generated"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}