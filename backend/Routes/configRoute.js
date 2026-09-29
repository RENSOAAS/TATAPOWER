const express = require("express");
const configRouter = express.Router();

const { getPrevDbSetting, dbConfigMiddleware } = require("../configHandlers/dbHandler");
const { getPrevMqttSetting, mqttConfigMiddleware } = require("../configHandlers/mqttConfigHandler")
const { emailConfigMiddleware, getPrevEmailSetting } = require("../configHandlers/emailConfigHandler")

// update config
configRouter.patch("/dbConfig", dbConfigMiddleware)
configRouter.patch("/mqttConfig", mqttConfigMiddleware)
configRouter.patch("/emailConfig", emailConfigMiddleware)
// get prev config data
configRouter.get("/getPrevDbSetting", getPrevDbSetting)
configRouter.get("/getPrevMqttSetting", getPrevMqttSetting)
configRouter.get("/getPrevEmailSetting", getPrevEmailSetting)

module.exports = configRouter;
