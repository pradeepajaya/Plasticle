const express = require("express");
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.post("/create-task-handler", auth, adminController.createTaskHandler);
router.get("/task-handlers", auth, adminController.getTaskHandlers);

// Soft delete (deactivate) a task handler
router.put('/deactivate-taskhandler/:id', adminController.deactivateTaskHandler);


module.exports = router;
