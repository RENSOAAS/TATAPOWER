const express = require("express");
const router = express.Router();

const { registerMachine, fetchWegid, fetchMachineData, getDataForChart } = require("../handlers/machineHandler");

router.post("/registerMachine", registerMachine);
router.get("/fetchWegid", fetchWegid);
router.post('/fetchMachineData', fetchMachineData);

router.post("/fetchDataForChart", getDataForChart)

module.exports = router;
