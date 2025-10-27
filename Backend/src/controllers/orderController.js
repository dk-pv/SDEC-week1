import Order from "../models/Order.js";
import { generateOrderId } from "../utils/generateOrderId.js";

export const createOrder = async (req, res) => {
  try {
    const { userName, products } = req.body; 

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "No products found in order" });
    }

    const orderId = generateOrderId()
    const newOrder = await Order.create({
      orderId,
      userName,
      products,
    });

    console.log(`📢 Admin notified: New order ${orderId} created by ${userName}`);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
