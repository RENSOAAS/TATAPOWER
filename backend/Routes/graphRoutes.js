const express = require("express");
const router = express.Router();

const { graphsDataHandler, fetchBarGraphData } = require("../handlers/graphsHandler");

router.post("/fetchDataForGraphs", graphsDataHandler)
router.post("/fetchBarGraphData", fetchBarGraphData)

module.exports = router;