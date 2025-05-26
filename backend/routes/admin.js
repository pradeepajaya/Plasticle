const express = require("express");
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.post("/create-task-handler", auth, adminController.createTaskHandler);
router.get("/task-handlers", auth, adminController.getTaskHandlers);
router.get("/filled-bins-with-collectors", adminController.getFilledBinsWithCollectors);


router.post('/allocate-collector', auth, adminController.allocateCollector);
module.exports = router;
