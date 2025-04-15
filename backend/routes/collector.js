const express = require("express");
const router = express.Router();
// const collectorController = require('../controllers/collectorController');
const taskHandlercon = require('../controllers/taskHandlerCon');


router.get("/assginBin", taskHandlercon.assginBinAuto);


module.exports = router;
