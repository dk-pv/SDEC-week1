import express from "express";
import { createOrder, generateQrCode , getAllOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);

router.get("/", getAllOrders);

router.put("/:id/qrcode", generateQrCode);

export default router;
