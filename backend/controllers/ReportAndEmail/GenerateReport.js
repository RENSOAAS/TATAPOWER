const db = require("../../Database/db");
const psqlToJson = require("./psql-json");
const { jsonToExcel } = require("./json-excel");
const xlsx = require("xlsx");

//Get machine data and returns the required data.
async function getData(machineName, from, to, workbook, filepath) {
    const tableName = machineName.toLowerCase();
    try {
        const query =
        `SELECT temperature_1, temperature_2, voltage_1, voltage_2, voltage_3, V12, V23, V31, current_1, current_2, current_3, power_1, frequency, mac_address, BRKON, BRKOFF, BUCALM, SPRCHA, MOGTRP, WTIALM, OTIALM, PRVTRP, APMAXDEMAND, APMINDEMAND, RPMAXDEMAND, RPMINDEMAND, APPMAXDEMAND, IMPACTENERGY, EXPACTENERGY, TOTACTENERGY, IMPREAENERGY, EXPREAENERGY, TOTREAENERGY, TOTAPPENERGY, THDVR, THDVY, THDVB, THDCL1, THDCL2, THDCL3, ERRCODE, log_time
        FROM $1:name
        WHERE log_time
        BETWEEN $2 AND $3
        ORDER BY log_time`;
        const queryValueArray = [tableName, from, to];
        let rowCount = 0;
        const reportData = await psqlToJson(query, queryValueArray);

        const excelSheetData = reportData.map((datum) => {
            const sheetData = {
                "S.NO": (rowCount += 1),
                ...datum,
                ...JSON.stringify(datum.data),
            };

            sheetData["log_time"] = formatDate(sheetData["log_time"])

            let sheetDataWithUpperTitle = {};

            Object.keys(sheetData).forEach((data) => {
                let newPair = { [data.toUpperCase()]: sheetData[data] };
                sheetDataWithUpperTitle = { ...sheetDataWithUpperTitle, ...newPair };
            });

            return sheetDataWithUpperTitle;
        });
        await jsonToExcel(machineName, excelSheetData, workbook, filepath);
    } catch (error) {
        console.log(error.message);
    }
};

const filepath = [];

async function getreport(from, to, machicheNames) {
    try {
        const workbook = xlsx.utils.book_new(); // Create new workbook;

        filepath.push(
            __dirname +
            "/Reports/Reports-" +
            new Date()
                .toString()
                .split(" ")
                .slice(0, 5)
                .join(":")
                .split(":")
                .join("-") +
            ".xlsx"
        );

        //Create sheet and stores the report data in the respective sheets
        machicheNames.forEach((name) => {
            getData(name, from, to, workbook, filepath[filepath.length - 1]);
        });
        return;
    } catch (error) {
        console.log(error.message);
    }
};

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = { filepath, getreport };



















// const db = require("../../Database/db");
// const psqlToJson = require("./psql-json");
// const { jsonToExcel } = require("./json-excel");
// const xlsx = require("xlsx");

// let filepath = [];

// // Get machine data and returns the required data.
// async function getreport(from, to, machicheNames) {
//     try {
//         const workbook = xlsx.utils.book_new();
//         const reportFilePath =
//             __dirname +
//             "/Reports/Reports-" +
//             new Date()
//                 .toString()
//                 .split(" ")
//                 .slice(0, 5)
//                 .join(":")
//                 .split(":")
//                 .join("-") +
//             ".xlsx";

//         filepath.push(reportFilePath);

//         await Promise.all(
//             machicheNames.map((name) => getData(name, from, to, workbook, reportFilePath))
//         );

//         return;
//     } catch (error) {
//         console.log(error.message);
//     }
// };

// async function getData(machineName, from, to, workbook, filepath) {
//     const tableName = machineName.toLowerCase();

//     try {
//     const query =
//       "SELECT * FROM $1:name WHERE log_time BETWEEN $2 AND $3";
//     const queryValueArray = [tableName, from, to];
//     let rowCount = 0;
//     const reportData = await psqlToJson(query, queryValueArray);

//         const excelSheetData = reportData.map((datum) => {
//             const sheetData = {
//                 "S.NO": (rowCount += 1),
//                 ...datum,
//                 ...JSON.stringify(datum.data),
//             };

//             sheetData["log_time"] = new Date(sheetData["log_time"]).toLocaleString();

//             let sheetDataWithUpperTitle = {};

//             Object.keys(sheetData).forEach((data) => {
//                 let newPair = { [data.toUpperCase()]: sheetData[data] };
//                 sheetDataWithUpperTitle = {
//                     ...sheetDataWithUpperTitle,
//                     ...newPair,
//                 };
//             });

//             return sheetDataWithUpperTitle;
//         });

//         await jsonToExcel(machineName, excelSheetData, workbook, filepath);
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// module.exports = { filepath, getreport };




