const bcrypt = require("bcryptjs");
const User = require("../models/User");
//const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });


// Create Task Handler (Only Admins)
exports.createTaskHandler = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied" });
  }

  const { username, email, password } = req.body;
  const role = "taskhandler";
  

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ username, email, passwordHash, role, isVerified: true,});
    await user.save();

    res.status(201).json({ message: "Task Handler Created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch Existing Task Handlers
exports.getTaskHandlers = async (req, res) => {
  try {
    const taskHandlers = await User.find({ role: "taskhandler",isActive: true  });
    if (!taskHandlers) {
      return res.status(404).json({ message: "No Task Handlers found" });
    }
    res.json(taskHandlers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// deactivate Task Handler
exports.deactivateTaskHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user first to construct new values
    const user = await User.findOne({ _id: id, role: 'taskhandler' });

    if (!user) {
      return res.status(404).json({ message: 'Task handler not found or invalid role' });
    }

    // Prepare updated values
    const updatedFields = {
      isActive: false,
      username: `deactivated-${user._id}`,
      email: `${user._id}@deactivated.com`,
    };

    const updatedHandler = await User.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({ message: 'Task handler deactivated', user: updatedHandler });
  } catch (error) {
    console.error('Error deactivating task handler:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
