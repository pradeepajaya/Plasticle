const express = require("express");
const { createBin, getDueLocations, checkUrgentAllocations } = require("../controllers/binController"); 

const router = express.Router();

// Route for creating a bin & generating QR
router.post("/createBin", createBin);

router.get('/due-locations', getDueLocations);
router.get('/check-urgent', checkUrgentAllocations);


module.exports = router;
