const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const collectorRoutes = require('./routes/collector');

const http = require('http');
const socketIO = require('socket.io');
const socketHandler = require('./sockets/socketHandler');
// require('./controllers/socketCon').watchChanges(); // Ensure the change stream is set up


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());


// Create HTTP server
const server = http.createServer(app);

// Setup socket
const io = socketIO(server, {
  cors: {
    origin: "*", // or set specific frontend URL
    methods: ["GET", "POST"]
  }
});
global._io = io;

socketHandler(io);

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
app.use("/api/posts", require("./routes/Post"));
app.use('/uploads', express.static('uploads'));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/taskhandlers", require("./routes/taskHandler"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on ${process.env.API_BASE_URL}`)); 

