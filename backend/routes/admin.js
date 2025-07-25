const express = require("express");
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.post("/create-task-handler", auth, adminController.createTaskHandler);
router.get("/task-handlers", auth, adminController.getTaskHandlers);

// Soft delete (deactivate) a task handler
router.put('/deactivate-taskhandler/:id', adminController.deactivateTaskHandler);


router.get("/available-collectors", auth, adminController.getAvailableCollectors);
router.get("/filled-bins-with-collectors", adminController.getFilledBinsWithCollectors);
router.post('/allocate-collector', auth, adminController.allocateCollector);
router.get("/vehiclearrival-basic", adminController.getVehicleArrivalBasic);
router.get('/daily-collection-stats', adminController.getDailyCollectionStats);
router.get('/manufacturers', adminController.getManufacturers);
router.put('/manufacturers/:userId', adminController.updateManufacturerDetails);
router.get('/manufacturers/deleted', adminController.getDeletedManufacturers);
router.delete('/manufacturers/:userId', adminController.deleteManufacturer);
router.get('/check-status', adminController.checkFullBinsAndCollectors);




//sk
router.post("/createMachine", adminController.createMachine); 
router.patch("/updateMachine", adminController.updateMachine); 
router.delete("/deleteMachine", adminController.deleteMachine); 
router.patch("/assignMachine", adminController.assignMachine);
router.get("/getTaskHandler", adminController.getTaskHandler);

router.get("/assignedMachines", adminController.assignedMachines); 
router.get("/notAssignedMachines", adminController.notAssignedMachines); 

router.put("/assignMachine", adminController.assignMachine);




module.exports = router;