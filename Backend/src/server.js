import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Connect DB & start server
connectDB();
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
