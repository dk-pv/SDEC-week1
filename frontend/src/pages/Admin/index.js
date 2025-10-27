import { useEffect, useState } from "react";
import { getAllOrders } from "../../services/adminService";
import OrderTable from "../../components/OrderTable";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading orders...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Admin Dashboard</h1>
      <OrderTable orders={orders} />
    </div>
  );
}
