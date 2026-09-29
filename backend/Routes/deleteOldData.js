const express = require("express");
const router = express.Router();

const { deleteOldData } = require("../controllers/deleteOldData");

router.get("/deleteOldData", deleteOldData);

module.exports = router;