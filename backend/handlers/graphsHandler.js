const db = require("../Database/db");

exports.graphsDataHandler = async (req, res) => {
    const { selectedMachine, periodFrom, periodTo } = req.body
    try {
        const data = await db.manyOrNone(
            'SELECT v12, v23, v31, current_1, current_2, current_3, temperature_1, temperature_2, log_time FROM $1:name WHERE log_time BETWEEN $2 AND $3',
            [selectedMachine, periodFrom, periodTo]
        )
        
        return res.status(data && data.length > 0 ? 200 : 404).json({
            status: data && data.length > 0,
            data: data,
            message: data && data.length > 0 ? undefined : "Data not found",
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

exports.fetchBarGraphData = async (req, res) => {
    const { selectedMachine, periodFrom, periodTo } = req.body
    try {
        const data = await db.manyOrNone(
            `SELECT t1.impactEnergy, t1.expActEnergy, t1.totActEnergy, t1.impReaEnergy, t1.expReaEnergy, t1.totReaEnergy, t1.totAppEnergy, t1.log_time 
            FROM $1:name t1
            WHERE t1.log_time IN (
                SELECT MAX(log_time) AS max_log_time
                FROM $2:name
                WHERE log_time BETWEEN $3 AND $4
                GROUP BY DATE_TRUNC('day', log_time)
            )
            ORDER BY t1.log_time ASC;
            `,
            [selectedMachine, selectedMachine, periodFrom, periodTo]
        );

        const barGraphData = {
            IMPACTENERGY: [],
            EXPACTENERGY: [],
            TOTACTENERGY: [],
            IMPREAENERGY: [],
            EXPREAENERGY: [],
            TOTREAENERGY: [],
            TOTAPPENERGY: [],
            log_time: [],
        }

        data.forEach((row) => {
            barGraphData.IMPACTENERGY.push(row.impactenergy)
            barGraphData.EXPACTENERGY.push(row.expactenergy)
            barGraphData.TOTACTENERGY.push(row.totactenergy)
            barGraphData.IMPREAENERGY.push(row.impreaenergy)
            barGraphData.EXPREAENERGY.push(row.expreaenergy)
            barGraphData.TOTREAENERGY.push(row.totreaenergy)
            barGraphData.TOTAPPENERGY.push(row.totappenergy)
            barGraphData.log_time.push(row.log_time)
        })

        return res.status(data && data.length > 0 ? 200 : 404).json({
            status: data && data.length > 0,
            data: barGraphData,
            message: data && data.length > 0 ? undefined : 'Data not found',
        })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};