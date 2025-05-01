const express = require("express");
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.post("/create-task-handler", auth, adminController.createTaskHandler);
router.get("/task-handlers", auth, adminController.getTaskHandlers);

module.exports = router;
