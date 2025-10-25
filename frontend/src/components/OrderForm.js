


// import { useState } from "react";
// import { createOrder } from "../services/orderService";

// export default function OrderForm() {
//   const [userName, setUserName] = useState("");
//   const [products, setProducts] = useState([
//     { name: "", price: "", quantity: 1 },
//   ]);
//   const [message, setMessage] = useState("");

//   // 🧾 Add a new product row
//   const addProduct = () => {
//     setProducts([...products, { name: "", price: "", quantity: 1 }]);
//   };

//   const removeProduct = (index) => {
//     const updated = [...products];
//     updated.splice(index, 1);
//     setProducts(updated);
//   };

//   // ✏️ Handle input changes
//   const handleProductChange = (index, e) => {
//     const { name, value } = e.target;
//     const updated = [...products];
//     updated[index][name] = value;
//     setProducts(updated);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const orderData = {
//         userName,
//         products: products.map((p) => ({
//           name: p.name,
//           price: Number(p.price),
//           quantity: Number(p.quantity),
//         })),
//       };

//       const result = await createOrder(orderData);

//       if (result.success) {
//         setMessage(`✅ Order Created! ID: ${result.order.orderId}`);
//         setUserName("");
//         setProducts([{ name: "", price: "", quantity: 1 }]);
//       } else {
//         setMessage("❌ Failed to create order.");
//       }
//     } catch (err) {
//       setMessage(`Error: ${err.message}`);
//     }
//   };

//   return (
//     <div style={{ padding: "20px", maxWidth: "600px" }}>
//       <h2>🛒 Place Your Order</h2>
//       <form onSubmit={handleSubmit}>
//         {/* User Name */}
//         <input
//           type="text"
//           name="userName"
//           value={userName}
//           onChange={(e) => setUserName(e.target.value)}
//           placeholder="Your Name"
//           required
//           style={{ display: "block", marginBottom: "10px", width: "100%" }}
//         />

//         {/* Product List */}
//         {products.map((product, index) => (
//           <div
//             key={index}
//             style={{
//               border: "1px solid #ccc",
//               padding: "10px",
//               marginBottom: "10px",
//               borderRadius: "8px",
//             }}
//           >
//             <input
//               type="text"
//               name="name"
//               placeholder="Product Name"
//               value={product.name}
//               onChange={(e) => handleProductChange(index, e)}
//               required
//               style={{ width: "32%", marginRight: "5px" }}
//             />
//             <input
//               type="number"
//               name="price"
//               placeholder="Price"
//               value={product.price}
//               onChange={(e) => handleProductChange(index, e)}
//               required
//               style={{ width: "30%", marginRight: "5px" }}
//             />
//             <input
//               type="number"
//               name="quantity"
//               placeholder="Qty"
//               value={product.quantity}
//               min="1"
//               onChange={(e) => handleProductChange(index, e)}
//               required
//               style={{ width: "20%", marginRight: "5px" }}
//             />
//             {products.length > 1 && (
//               <button
//                 type="button"
//                 onClick={() => removeProduct(index)}
//                 style={{ background: "#ff4d4d", color: "#fff" }}
//               >
//                 ❌
//               </button>
//             )}
//           </div>
//         ))}

//         {/* Add Product Button */}
//         <button
//           type="button"
//           onClick={addProduct}
//           style={{ marginBottom: "10px" }}
//         >
//           ➕ Add Another Product
//         </button>

//         {/* Submit */}
//         <button type="submit">🚀 Place Order</button>
//       </form>

//       {message && <p style={{ marginTop: "15px" }}>{message}</p>}
//     </div>
//   );
// }


import { useState } from "react";
import { createOrder } from "../services/orderService";

export default function OrderForm() {
  const [userName, setUserName] = useState("");
  const [products, setProducts] = useState([{ name: "", price: "", quantity: 1 }]);
  const [message, setMessage] = useState("");

  // 🧾 Add a new product row
  const addProduct = () => {
    setProducts([...products, { name: "", price: "", quantity: 1 }]);
  };

  // 🧮 Remove a product row
  const removeProduct = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  // ✏️ Handle input changes
  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...products];
    updated[index][name] = value;
    setProducts(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        userName,
        products: products.map((p) => ({
          name: p.name,
          price: Number(p.price),
          quantity: Number(p.quantity),
        })),
      };

      const result = await createOrder(orderData);

      if (result.success) {
        setMessage(`✅ Order Created! ID: ${result.order.orderId}`);

        // Auto-hide message after 2.5 seconds
        setTimeout(() => setMessage(""), 2500);

        setUserName("");
        setProducts([{ name: "", price: "", quantity: 1 }]);
      } else {
        setMessage("❌ Failed to create order.");
        setTimeout(() => setMessage(""), 2500);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4f8, #d9e2ec)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#0f4c81" }}>
          🛒 Place Your Order
        </h2>
        <form onSubmit={handleSubmit}>
          {/* User Name */}
          <input
            type="text"
            name="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your Name"
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "15px",
              padding: "10px 15px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />

          {/* Products */}
          {products.map((product, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
                gap: "10px",
              }}
            >
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={product.name}
                onChange={(e) => handleProductChange(index, e)}
                required
                style={{ flex: 2, padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={product.price}
                onChange={(e) => handleProductChange(index, e)}
                required
                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              <input
                type="number"
                name="quantity"
                placeholder="Qty"
                value={product.quantity}
                min="1"
                onChange={(e) => handleProductChange(index, e)}
                required
                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  style={{
                    background: "#ff4d4d",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  ❌
                </button>
              )}
            </div>
          ))}

          {/* Add Product Button */}
          <button
            type="button"
            onClick={addProduct}
            style={{
              marginBottom: "15px",
              padding: "10px 15px",
              background: "#0f4c81",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ➕ Add Another Product
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#2a9d8f",
              color: "#fff",
              fontSize: "16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            🚀 Place Order
          </button>
        </form>

        {/* Message */}
        {message && (
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: message.includes("✅") ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
