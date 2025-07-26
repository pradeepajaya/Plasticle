const express = require("express");
const { createBin, getDueLocations,  getAllBins } = require("../controllers/binController"); 

const router = express.Router();

// Route for creating a bin & generating QR
router.post("/createBin", createBin);

router.get('/due-locations', getDueLocations);

router.get('/getbins', getAllBins);

module.exports = router;
