import { useRouter } from "next/router";
import OrderForm from "../components/OrderForm";

export default function Home() {
  const router = useRouter();

  return (
    <div className="p-10 text-center">
      <OrderForm />
      <button
        onClick={() => router.push("/user/orders")}
        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        View My Orders
      </button>
    </div>
  );
}
