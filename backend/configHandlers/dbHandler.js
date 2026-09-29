const fs = require('fs');
const path = require('path');
const { runBackend } = require("./backend");

const createDB = require("../Database/createDB");
const createTables = require("../Database/create-table");

const configFile = path.join(__dirname, '/dbConfig.json');
const dbConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

exports.getPrevDbSetting = (req, res) => {
    try {
        return res.status(200).json({ status: true, prevSettings: dbConfig });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

exports.dbConfigMiddleware = async (req, res) => {
    const newConfig = {
        HOST: req.body.HOST,
        PASSWORD: req.body.PASSWORD,
        DB_PORT: req.body.DB_PORT,
        DATABASE: req.body.DATABASE,
        USER: req.body.USER
    };

    if (dbConfig.DATABASE === newConfig.DATABASE) {
        fs.writeFileSync(configFile, JSON.stringify(newConfig));
        res.status(200).json({ status: true, prevSettings: newConfig, message: "Backend Restarted" });
        runBackend(res);
    } else {
        fs.writeFileSync(configFile, JSON.stringify(newConfig));
        await createDB();
        await createTables();
        res.status(200).json({ status: true, prevSettings: newConfig, message: "Backend Restarted" });
        runBackend(res);
    }
};