const fs = require('fs');
const path = require('path');
const { runBackend } = require("./backend");

const configFile = path.join(__dirname, '/emailConfig.json');
const emailConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

exports.getPrevEmailSetting = (req, res) => {
    try {
        return res.status(200).json({ status: true, prevSettings: emailConfig });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

exports.emailConfigMiddleware = (req, res) => {
    const newConfig = {
        HOST: req.body.HOST,
        PORT: req.body.PORT,
        EMAIL: req.body.EMAIL,
        PASSWORD: req.body.PASSWORD
    }
    fs.writeFileSync(configFile, JSON.stringify(newConfig))
    return res.status(200).json({ status: true, prevSettings: newConfig, message: "Backend Restarted" });
    runBackend(res);
};