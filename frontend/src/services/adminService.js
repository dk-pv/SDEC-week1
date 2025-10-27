import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getAllOrders = async () => {
  const response = await axios.get(`${API_URL}/api/orders`);
  return response.data;
};


export const generateQr = async (orderId) => {
  const res = await axios.put(`${API_URL}/api/orders/${orderId}/qrcode`);
  return res.data;
};