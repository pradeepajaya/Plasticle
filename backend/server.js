const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const collectorRoutes = require('./routes/collector');


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const createAdminUser = async () => {
    const adminExists = await User.findOne({ role: "admin" });
  
    if (!adminExists) {
      const passwordHash = await bcrypt.hash("test1", 10);
  
      const admin = new User({
        username: "AdminUser",
        email: "admin@example.com",
        passwordHash,
        role: "admin",
        isVerified: true,
      });
  
      await admin.save();
      console.log("Admin user created: admin@example.com / test1");
    }
  };
  
  createAdminUser();
// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/manufacturer", require("./routes/manufacturer"));
app.use("/api/bins", require("./routes/bin"));
app.use("/api/buyer", require("./routes/buyer"));
app.use("/api/collector", require("./routes/collector"));
app.use("/api/task-handler", require("./routes/bottle"));
app.use("/api/posts", require("./routes/post"));
app.use('/uploads', express.static('uploads'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://192.168.8.137:${PORT}`)); 

