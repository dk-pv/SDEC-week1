const API_URL = "http://localhost:5000/api/orders"; // backend URL

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

