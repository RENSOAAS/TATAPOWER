const express = require("express");
const router = express.Router();

const { getCommunicationErrors } = require("../handlers/communicationHandler");

router.get("/communicationErrors", getCommunicationErrors);

module.exports = router;
