import Order from "../models/Order.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import { io } from "../server.js";

export const createOrder = async (req, res) => {
  try {
    const { userName, products } = req.body;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No products found in order" });
    }
    const orderId = generateOrderId();
    const newOrder = await Order.create({
      orderId,
      userName,
      products,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("error creating order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




export const generateQrCode = async (req, res) => {
  try {
    const { id } = req.params;
    const adminSecret = process.env.JWT_SECRET || "securekey";

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
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

    io.emit("orderUpdated", {
      orderId: order._id,
      status: order.status,
      qrGenerated: true,
    });

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




export const verifyQrToken = async (req, res) => {
  try {
    const { token } = req.params;
    const secret = process.env.JWT_SECRET || "superstrongkey123";
    const decoded = jwt.verify(token, secret);

    const order = await Order.findById(decoded.orderId);
    if (!order) {
      console.log("Order not found for token:", decoded.orderId);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "QR verified successfully",
      order: {
        _id: order._id,
        orderId: order.orderId,
        userName: order.userName,
        totalAmount: order.totalAmount,
        status: order.status,
        products: order.products,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        qrCode: order.qrCode,
      },
    });
  } catch (error) {
    console.error("QR Verify Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "QR token expired. Please request a new QR code.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Invalid QR token or unauthorized access.",
    });
  }
};




export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = [
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded",
      "Failed",
    ];

    if (!status || !validStatuses.includes(status)) {
      console.log("Invalid status value:", status);
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value provided." });
    }

    if (!id || id.length !== 24) {
      console.log("Invalid or missing Order ID:", id);
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Order ID.",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      console.log("Order not found:", id);
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    io.emit("orderUpdated", {
      orderId: updatedOrder._id,
      status: updatedOrder.status,
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to '${updatedOrder.status}' successfully.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update status error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating order status.",
      error: error.message,
    });
  }
};



export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
