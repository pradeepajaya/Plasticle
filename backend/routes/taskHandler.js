const express = require("express");
const router = express.Router();

const {
  getFullBins,
  getActiveTaskHandlers,
  assignBinToHandler,
  getTaskHandlerAssignments,
  getTaskHandlerByUserId,
   getAssignedBinsForHandler,
   collectBinFromHandler,
   collectBin
} = require("../controllers/taskHandlerController");

// Route declarations
router.get("/full", getFullBins);
router.get("/active", getActiveTaskHandlers);
router.post("/assign-bin", assignBinToHandler);

router.get("/assignments", getTaskHandlerAssignments);

router.get("/by-user/:userId", getTaskHandlerByUserId);

router.get("/assigned-bins/:handlerId", getAssignedBinsForHandler);

//router.patch("/collect-bin/:binId/:handlerId", collectBinFromHandler);

router.patch("/collect-bin/:binId/:handlerId", collectBin);


module.exports = router;
