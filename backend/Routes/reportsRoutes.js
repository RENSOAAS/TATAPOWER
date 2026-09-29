const express = require("express");
const router = express.Router();

const { getUnfilteredData, getFilteredData } = require("../handlers/reportsHandler");
// Email report
const emailReport = require("../controllers/ReportAndEmail/EmailReport");
// Download report
const downloadReport = require("../controllers/ReportAndEmail/Download");

router.post("/getUnfilteredData", getUnfilteredData);
router.post("/getFilteredData", getFilteredData);

// Email report
router.post("/emailReport", emailReport.emailReport);

// Download report
router.post("/generateFileAndGetFilename", downloadReport.generateFileAndGetFilename);
router.get("/downloadReport", downloadReport.downloadReport);

module.exports = router;
