const express = require("express");
const router = express.Router();

const { getMachines, updateMachineDetails, removeMachine } = require("../handlers/settingHandler");

router.get("/getMachines", getMachines);
router.put("/updateMachineDetails", updateMachineDetails);
router.delete("/removeMachine", removeMachine);

module.exports = router;
