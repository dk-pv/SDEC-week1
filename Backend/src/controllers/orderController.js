import Order from "../models/Order.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import { io } from "../server.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createOrder = async (req, res) => {
  try {
    const { userName, products, email } = req.body;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No products found in order" });
    }

    const orderId = generateOrderId();
    const newOrder = await Order.create({
      orderId,
      userName,
      email,
      products,
    });

    io.emit("newOrder", newOrder);

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
    const adminSecret = process.env.JWT_SECRET;
    if (!adminSecret) throw new Error("JWT_SECRET not configured");

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const qrToken = jwt.sign(
      {
        orderId: order._id,
        userName: order.userName,
        email: order.email,
        issuedAt: Date.now(),
      },
      adminSecret,
      { expiresIn: "2d" } 
    );

    const qrDataURL = await QRCode.toDataURL(
      `${process.env.FRONTEND_URL}/scan/${qrToken}`
    );

    order.qrCode = qrDataURL;
    order.qrToken = qrToken;
    order.qrGeneratedByAdmin = true;
    order.status = "Confirmed";

    await order.save();

    const emailHtml = `
      <h2>Hi ${order.userName},</h2>
      <p>Your order <b>${order.orderId}</b> has been <b>confirmed</b>.</p>
      <p>We'll notify you when your order is processed and ready for shipment.</p>
      <p>Thank you for choosing us! 💙</p>
    `;

    await sendEmail(order.email, "Your Order is Confirmed 🎉", emailHtml);

    io.emit("orderUpdated", {
      orderId: order._id,
      status: order.status,
      qrGenerated: true,
    });

    io.emit("orderConfirmedForUser", {
      email: order.email,
      order: order,
    });

    res.status(200).json({
      success: true,
      message: "QR generated & confirmation email sent.",
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
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const decoded = jwt.verify(token, secret);

    const order = await Order.findById(decoded.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.qrToken !== token) {
      return res.status(401).json({
        success: false,
        message: "QR token mismatch or invalid.",
      });
    }

    res.status(200).json({
      success: true,
      message: "QR verified successfully",
      order: {
        _id: order._id,
        orderId: order.orderId,
        userName: order.userName,
        email: order.email,
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

    if (updatedOrder.email) {
      let subject = `Order ${updatedOrder.orderId} - Status: ${status}`;
      let html = `
        <h2>Hi ${updatedOrder.userName},</h2>
        <p>Your order <b>${updatedOrder.orderId}</b> status has been updated to <b>${status}</b>.</p>
      `;

      if (status === "Processing") {
        html += `<p>We’re preparing your order for shipment 🚀.</p>`;
      } else if (status === "Shipped") {
        html += `<p>Your order is on the way 🚚.</p>`;
      } else if (status === "Out for Delivery") {
        html += `<p>Our delivery agent will reach you soon 📦.</p>`;
      } else if (status === "Delivered") {
        html += `<p>Thank you! Your order has been successfully delivered 🎉.</p>`;
      } else if (status === "Cancelled") {
        html += `<p>Your order has been cancelled ❌. Please contact support if you need help.</p>`;
      } else if (status === "Returned") {
        html += `<p>Your return request is being processed 🔄.</p>`;
      } else if (status === "Refunded") {
        html += `<p>Your refund has been issued successfully 💰.</p>`;
      } else if (status === "Failed") {
        html += `<p>There was an issue with your order. Please contact support.</p>`;
      }

      try {
        await sendEmail(updatedOrder.email, subject, html);
        console.log(
          `📧 Email sent to ${updatedOrder.email} for status: ${status}`
        );
      } catch (emailErr) {
        console.error("❌ Email sending failed:", emailErr);
      }
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
    const { email } = req.params;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }
    const orders = await Order.find({
      email: email.toLowerCase().trim(),
      status: { $ne: "Pending Admin Confirmation" },
    }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this email",
      });
    }

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders by email:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
