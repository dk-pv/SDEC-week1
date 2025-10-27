import Order from "../models/Order.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";


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


export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// export const generateQrCode = async (req, res) => {
//   try {
//     const { id } = req.params; // order ID (MongoDB _id)
//     const adminSecret = process.env.JWT_SECRET || "securekey";

//     // 1️⃣ Find the order
//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // 2️⃣ Generate secure token (valid for 7 days)
//     const qrToken = jwt.sign(
//       { orderId: order._id, userName: order.userName },
//       adminSecret,
//       { expiresIn: "7d" }
//     );

//     // 3️⃣ Create QR URL (this will be scanned later)
//     const qrDataURL = await QRCode.toDataURL(
//       `${process.env.FRONTEND_URL}/scan/${qrToken}`
//     );

//     // 4️⃣ Update order with QR info
//     order.qrCode = qrDataURL;
//     order.qrToken = qrToken;
//     order.qrGeneratedByAdmin = true;
//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: "QR code generated successfully",
//       qrCode: qrDataURL,
//       orderId: order.orderId,
//     });
//   } catch (error) {
//     console.error("❌ QR generation error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


export const generateQrCode = async (req, res) => {
  try {
    const { id } = req.params;
    const adminSecret = process.env.JWT_SECRET || "securekey";

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const qrToken = jwt.sign(
      { orderId: order._id, userName: order.userName },
      adminSecret,
      { expiresIn: "7d" }
    );

    const qrDataURL = await QRCode.toDataURL(
      `${process.env.FRONTEND_URL}/scan/${qrToken}`
    );

    order.qrCode = qrDataURL;
    order.qrToken = qrToken;
    order.qrGeneratedByAdmin = true;

    order.status = "Confirmed";

    await order.save();

    res.status(200).json({
      success: true,
      message: "QR code generated successfully & status updated to Confirmed",
      qrCode: qrDataURL,
      orderId: order.orderId,
      status: order.status,
    });
  } catch (error) {
    console.error("❌ QR generation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
