const express = require("express");
const router = express.Router();

const { getLogs } = require("../handlers/logsHandler")

router.get("/logs", getLogs);

module.exports = router;
