import express from "express";
import {
  createOrder,
  generateQrCode,
  getAllOrders,
  verifyQrToken,
  updateOrderStatus,
  getOrdersByUser
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);

router.get("/", getAllOrders);

router.put("/:id/qrcode", generateQrCode);

router.get("/verify/:token", verifyQrToken);

router.put("/status/:id", updateOrderStatus);

router.get("/user/:userId", getOrdersByUser);

export default router;
