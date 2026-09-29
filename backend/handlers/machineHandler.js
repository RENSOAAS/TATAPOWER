const db = require("../Database/db");

// Machine registration
const registerMachine = async (req, res) => {
    const {
        wegid,
        state,
        district,
        area,
        sub_area,
        feeder_no,
        iot_sim_no,
        device_id
    } = req.body;

    try {
        // register machine into db
        const tables = await db.many(
            "SELECT table_name FROM information_schema.tables"
        );

        const insertIntoMachinesTable = async () => {
            const foundWegid = await db.manyOrNone(
                `SELECT wegid, state, district, area, sub_area FROM machines_table 
                WHERE wegid = $1`,
                [wegid]
            );

            if (foundWegid[0]) {
                return res.json({ status: false, message: "Registered machine already exist" });
            } else {
                await db.none(
                    "INSERT INTO machines_table (wegid, state, district, area, sub_area, feeder_number, iot_sim_number, device_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
                    [
                        wegid,
                        state,
                        district,
                        area,
                        sub_area,
                        feeder_no,
                        iot_sim_no,
                        device_id
                    ]
                );
                return res
                    .status(200)
                    .json({ status: true, message: `Machine ${wegid} registered successfully` });
            }
        };

        const createTableWithWegidAsTableName = async () => {
            const checkTableWithWegidAsTableName = tables.filter(
                (name) => name.table_name === `${wegid}`
            );

            if (!checkTableWithWegidAsTableName[0]) {
                await db.none(
                    `CREATE TABLE IF NOT EXISTS ${wegid}(
                        id SERIAL,
                        temperature_1 NUMERIC(7,2) NOT NULL,
                        temperature_2 NUMERIC(7,2) NOT NULL,
                        voltage_1 NUMERIC(7,2) NOT NULL,
                        voltage_2 NUMERIC(7,2) NOT NULL,
                        voltage_3 NUMERIC(7,2) NOT NULL,
                        v12 NUMERIC(7,2) NOT NULL,
                        v23 NUMERIC(7,2) NOT NULL,
                        v31 NUMERIC(7,2) NOT NULL,
                        current_1 NUMERIC(7,2) NOT NULL,
                        current_2 NUMERIC(7,2) NOT NULL,
                        current_3 NUMERIC(7,2) NOT NULL,
                        power_1 NUMERIC(7,2) NOT NULL,
                        frequency NUMERIC(7,2) NOT NULL,
                        mac_address VARCHAR(25) NOT NULL,
                        BRKON INT NOT NULL,
                        BRKOFF INT NOT NULL,
                        BUCALM INT NOT NULL,
                        SPRCHA INT NOT NULL,
                        MOGTRP INT NOT NULL,
                        WTIALM INT NOT NULL,
                        OTIALM INT NOT NULL,
                        PRVTRP INT NOT NULL,
                        APMAXDEMAND NUMERIC(9,2),
                        APMINDEMAND NUMERIC(9,2),
                        RPMAXDEMAND NUMERIC(9,2),
                        RPMINDEMAND NUMERIC(9,2),
                        APPMAXDEMAND NUMERIC(9,2),
                        IMPACTENERGY NUMERIC(9,2),
                        EXPACTENERGY NUMERIC(9,2),
                        TOTACTENERGY NUMERIC(9,2),
                        IMPREAENERGY NUMERIC(9,2),
                        EXPREAENERGY NUMERIC(9,2),
                        TOTREAENERGY NUMERIC(9,2),
                        TOTAPPENERGY NUMERIC(9,2),
                        THDVR NUMERIC(9,2) NOT NULL,
                        THDVY NUMERIC(9,2) NOT NULL,
                        THDVB NUMERIC(9,2) NOT NULL,
                        THDCL1 NUMERIC(9,2) NOT NULL,
                        THDCL2 NUMERIC(9,2) NOT NULL,
                        THDCL3 NUMERIC(9,2) NOT NULL,
                        ERRCODE INT NOT NULL,
                        log_time TIMESTAMP NOT NULL DEFAULT NOW()
                    );`
                );
                return res
                    .status(200)
                    .json({ status: true, message: `${wegid} table created successfully` });
                
            } else {
                return res.json({ status: false, message: `${wegid} table already exist` });
            }
        };

        const data = await Promise.all([
            insertIntoMachinesTable(),
            createTableWithWegidAsTableName()
        ]);

        return data;
    } catch (error) {
        return error.message;
    }
};

// fetch wegid from machines_table
const fetchWegid = async (req, res) => {
    try {
        const dataList = {};
        const listOfWegid = await db.manyOrNone(
            "SELECT wegid FROM machines_table ORDER BY wegid"
        );
        columns1 = Object.keys(listOfWegid[0]);
        columns1.forEach((column) => {
            dataList[column] = listOfWegid.map((datum) => datum[column]);
        });

        const dataList2 = {}
        const listOfFeederNumber = await db.manyOrNone(
            "SELECT feeder_number FROM machines_table ORDER BY wegid"
        );
        columns2 = Object.keys(listOfFeederNumber[0]);
        columns2.forEach((column) => {
            dataList2[column] = listOfFeederNumber.map((datum) => datum[column]);
        });

        return res.status(200).json({ status: true, listOfWegid: dataList, listOfFeederNumber: dataList2 });
    } catch (error) {
        return res
            .status(500)
            .json({ status: false, message: error.message });
    }
};

// fetch machines data
const fetchMachineData = async (req, res) => {
    const machineName = req.body.wegid;
    try {
        const data = await db.manyOrNone(
            `SELECT * FROM machines_table WHERE wegid=$1`,
            [machineName]
        );
        return res.status(200).json({ status: true, data: data[0] });
    } catch (error) {
        return res
            .status(500)
            .json({ status: false, message: error.message });
    }
};

// Get data for chart
const getDataForChart = async (req, res) => {
    const { wegid, parameter, dateFrom, dateTo } = req.body;
    const machineName = wegid.toLowerCase();
        
    try {
        const dataList = {};
        const data = await db.manyOrNone(
            `SELECT ${parameter} FROM ${machineName} WHERE log_time BETWEEN $1 AND $2`,
            [dateFrom, dateTo]
        );
        columns1 = Object.keys(data[0]);
        columns1.forEach((column) => {
            dataList[column] = data.map((datum) => datum[column]);
        });
        return res.status(200).json({ status: true, data: dataList });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = {registerMachine, fetchWegid, fetchMachineData, getDataForChart};