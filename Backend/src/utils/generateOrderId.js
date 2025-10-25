export const generateOrderId = () => {
  const prefix = "ORD";
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomNum}`;
};
