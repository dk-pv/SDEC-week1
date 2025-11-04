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
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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

    qrCode: {
      type: String,
      default: null,
    },

    qrToken: {
      type: String,
      default: null,
    },

    qrGeneratedByAdmin: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "Pending Admin Confirmation",
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
        "Refunded",
      ],
      default: "Pending Admin Confirmation",
    },

    statusHistory: [
      {
        status: { type: String },
        changedBy: { type: String }, // 'Admin' or 'System' or 'User'
        timestamp: { type: Date, default: Date.now },
        note: { type: String }, // optional comment
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 🧮 Auto calculate total amount
orderSchema.pre("save", function (next) {
  this.totalAmount = this.products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  next();
});

// 🧱 Prevent editing completed (Delivered) orders
orderSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const orderId = this.getQuery()._id || this.getQuery().id;

  if (!orderId) return next();

  const order = await this.model.findById(orderId);
  if (!order) return next();

  // Prevent updates if order is already delivered
  if (order.status === "Delivered") {
    const err = new Error(
      "Completed orders cannot be modified (read-only protection enabled)."
    );
    err.status = 403;
    return next(err);
  }

  if (update.status && update.status !== order.status) {
    const historyEntry = {
      status: update.status,
      changedBy: "Admin",
      timestamp: new Date(),
      note: `Status changed from ${order.status} → ${update.status}`,
    };

    // Push history entry
    await order.updateOne({ $push: { statusHistory: historyEntry } });
  }

  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
