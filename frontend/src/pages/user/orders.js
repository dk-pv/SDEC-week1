// import { useState, useEffect } from "react";
// import axios from "axios";
// import { io } from "socket.io-client";

// const socket = io(process.env.NEXT_PUBLIC_API_URL);

// export default function UserOrders() {
//   const [userId, setUserId] = useState("");
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searched, setSearched] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/orders/user/${userId}`
//       );
//       if (res.data.success) {
//         setOrders(res.data.orders);
//         setSearched(true);
//       } else {
//         setOrders([]);
//       }
//     } catch (err) {
//       console.error("Error fetching orders:", err);
//       setOrders([]);
//       setSearched(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Listen for Realtime Status Updates
//   useEffect(() => {
//     socket.on("orderUpdated", (data) => {
//       console.log("📦 Realtime update received:", data);
//       setOrders((prev) =>
//         prev.map((order) =>
//           order._id === data.orderId ? { ...order, status: data.status } : order
//         )
//       );
//     });

//     return () => socket.disconnect();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 p-10 text-center">
//       <h1 className="text-3xl font-bold mb-6 text-indigo-700">
//         🔍 Find My Orders
//       </h1>

//       <form
//         onSubmit={handleSubmit}
//         className="mb-8 flex justify-center items-center"
//       >
//         <input
//           type="text"
//           placeholder="Enter your User ID"
//           value={userId}
//           onChange={(e) => setUserId(e.target.value)}
//           className="border border-gray-300 p-2 rounded-lg w-64 text-center focus:ring-2 focus:ring-indigo-500"
//           required
//         />
//         <button
//           type="submit"
//           className="ml-3 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//         >
//           Search
//         </button>
//       </form>

//       {loading && <p className="text-gray-500">Loading orders...</p>}

//       {searched && orders.length === 0 && !loading && (
//         <p className="text-gray-600">No orders found for this User ID.</p>
//       )}

//       {orders.length > 0 && (
//         <div className="mt-6 bg-white rounded-xl shadow-xl p-6 max-w-3xl mx-auto">
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">
//             🧾 Your Orders ({orders.length})
//           </h2>
//           <div className="divide-y divide-gray-200">
//             {orders.map((order) => (
//               <div
//                 key={order._id}
//                 className="py-3 flex justify-between items-center hover:bg-gray-50 px-3 rounded-lg transition"
//               >
//                 <div className="text-left">
//                   <p className="font-semibold text-gray-900">{order.orderId}</p>
//                   <p className="text-sm text-gray-500">
//                     ₹{order.totalAmount.toLocaleString()}
//                   </p>
//                 </div>
//                 <span
//                   className={`px-3 py-1 rounded-full text-sm font-medium border ${
//                     order.status === "Delivered"
//                       ? "bg-green-100 text-green-800 border-green-200"
//                       : order.status === "Cancelled"
//                       ? "bg-red-100 text-red-800 border-red-200"
//                       : "bg-yellow-100 text-yellow-800 border-yellow-200"
//                   }`}
//                 >
//                   {order.status}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

const socket = io(process.env.NEXT_PUBLIC_API_URL);

const ORDER_STATUSES = [
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered"
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

const getStatusIndex = (status) => {
  return ORDER_STATUSES.indexOf(status);
};

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
                width: `${(currentIndex / (ORDER_STATUSES.length - 1)) * 100}%`
              }}
            />
          </div>

          {ORDER_STATUSES.map((status, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

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
          <p className="text-gray-500">Enter your User ID to view order status</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-3"
        >
          <input
            type="text"
            placeholder="Enter your User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
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

        {searched && orders.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders found for this User ID</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg border border-gray-200"
              >
                <div className="bg-blue-50 p-4 flex justify-between items-center border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-semibold text-gray-800">{order.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="font-bold text-lg text-gray-800">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-5">
                  {renderStatusTracker(order.status)}
                </div>

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
      </div>
    </div>
  );
}