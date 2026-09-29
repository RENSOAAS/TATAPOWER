const fs = require('fs');
const path = require('path');
const { runBackend } = require("./backend");

const configFile = path.join(__dirname, '/mqttConfig.json');
const mqttConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

exports.getPrevMqttSetting = (req, res) => {
    try {
        return res.status(200).json({ status: true, prevSettings: mqttConfig });
        
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

exports.mqttConfigMiddleware = (req, res) => {
    const newConfig = {
        PORT: req.body.PORT,
        HOST: req.body.HOST,
        USERNAME: req.body.USERNAME,
        PASSWORD: req.body.PASSWORD,
        PROTOCOL: req.body.PROTOCOL
    }
    fs.writeFileSync(configFile, JSON.stringify(newConfig))
    res.status(200).json({ status: true, prevSettings: newConfig, message: "Backend Restarted" });
    runBackend(res);    
};