const express = require("express");
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");
const taskHandlerCon = require("../controllers/taskHandlerCon");
const router = express.Router();

router.post("/create-task-handler", auth, adminController.createTaskHandler);
router.get("/task-handlers", auth, adminController.getTaskHandlers);

//router.get("/assginBin", taskHandlerCon.assginBinManual); 
router.post("/createMachine", adminController.createMachine); 
router.get("/getMachine", adminController.getMachine); 
router.patch("/updateMachine", adminController.updateMachine); 
router.delete("/deleteMachine", adminController.deleteMachine); 
router.get("/assignMachine", adminController.assignMachine);
router.get("/getTaskHandler", adminController.getTaskHandler);

module.exports = router;
