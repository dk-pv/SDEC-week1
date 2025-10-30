import { useState } from "react";
import { createOrder } from "../services/orderService";
import { toast } from "react-hot-toast";

export default function OrderForm() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [products, setProducts] = useState([
    { name: "", price: "", quantity: 1 },
  ]);
  const [message, setMessage] = useState("");

  const addProduct = () => {
    setProducts([...products, { name: "", price: "", quantity: 1 }]);
  };

  const removeProduct = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...products];
    updated[index][name] = value;
    setProducts(updated);
  };

  const incrementQuantity = (index) => {
    const updated = [...products];
    updated[index].quantity = Number(updated[index].quantity) + 1;
    setProducts(updated);
  };

  const decrementQuantity = (index) => {
    const updated = [...products];
    if (Number(updated[index].quantity) > 1) {
      updated[index].quantity = Number(updated[index].quantity) - 1;
      setProducts(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        userName,
        email,
        products: products.map((p) => ({
          name: p.name,
          price: Number(p.price),
          quantity: Number(p.quantity),
        })),
      };

      const result = await createOrder(orderData);

      if (result.success) {
        toast.success(`Order Created! ID: ${result.order.orderId}`);

        setMessage(`Order Created! ID: ${result.order.orderId}`);
        setTimeout(() => setMessage(""), 2500);

        setUserName("");
        setEmail("");
        setProducts([{ name: "", price: "", quantity: 1 }]);
      } else {
        toast.error("Failed to create order.");
        setMessage("Failed to create order.");
        setTimeout(() => setMessage(""), 2500);
      }
    } catch (err) {
      toast.error("Error creating order.");
      setMessage(`Error: ${err.message}`);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            Place Your Order
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                name="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* ✅ Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Products
              </label>

              {products.map((product, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      name="name"
                      placeholder="Product Name"
                      value={product.name}
                      onChange={(e) => handleProductChange(index, e)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Price"
                      value={product.price}
                      onChange={(e) => handleProductChange(index, e)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Quantity:
                      </span>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => decrementQuantity(index)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          name="quantity"
                          value={product.quantity}
                          min="1"
                          onChange={(e) => handleProductChange(index, e)}
                          required
                          className="w-16 px-2 py-2 text-center border-x border-gray-300 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => incrementQuantity(index)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addProduct}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
              >
                + Add Another Product
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition"
            >
              Place Order
            </button>
          </form>

          {/* Message (optional, still keeps your old logic) */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-lg text-center font-medium ${
                message.includes("")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
