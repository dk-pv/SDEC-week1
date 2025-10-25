import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: String,
      default: () => `USER-${Math.floor(100000 + Math.random() * 900000)}`,
    },

    userName: {
      type: String,
      required: true,
    },

    products: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
      },
    ],

    totalAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "Pending Admin Confirmation",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  this.totalAmount = this.products.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
