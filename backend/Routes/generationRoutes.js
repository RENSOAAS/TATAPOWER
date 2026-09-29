const express = require("express");
const router = express.Router();

const { getGenerationSummary } = require("../handlers/generationHandler");

router.post("/fetchGenerationSummary", getGenerationSummary);

module.exports = router;
