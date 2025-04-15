const express = require("express");
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");
const taskHandlerCon = require("../controllers/taskHandlerCon");
const router = express.Router();

router.post("/create-task-handler", auth, adminController.createTaskHandler);
router.get("/task-handlers", auth, adminController.getTaskHandlers);

router.get("/assginBin", taskHandlerCon.assginBinManual); 
router.get("/createMachine", taskHandlerCon.createMachine); 
router.get("/getMachine", taskHandlerCon.getMachine); 
router.get("/updateMachine", taskHandlerCon.updateMachine); 
router.get("/deleteMachine", taskHandlerCon.deleteMachine); 


module.exports = router;


// code before creating controller

/* const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Create Task Handlers (Only Admins)
router.post("/create-task-handler", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access Denied" });

  const { username, email, password } = req.body;
  const role = "taskhandler"; // Hardcoded role to ensure only one type of handler


   // commented start 

  /*if (role !== "bin_handler" && role !== "scan_handler") {
    return res.status(400).json({ message: "Invalid task handler role" });
  }
      
    // commented finish 

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ username, email, passwordHash, role });
    await user.save();

    res.status(201).json({ message: "Task Handler Created" });

    // commented start 

   /* res.status(201).json({ 
      message: "Task Handler Created",
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      } 
    });

    // commented finish 
    
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// Fetch the existing Task Handler
router.get("/task-handlers", auth, async (req, res) => {
  try {
    const taskHandlers = await User.find({ role: "taskhandler" }); // Fetch all task handlers
    if (!taskHandlers.length) return res.status(404).json({ message: "No Task Handlers found" });

    res.json(taskHandlers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
 
*/

