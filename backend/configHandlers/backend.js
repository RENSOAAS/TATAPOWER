// const { exec } = require("child_process");

// function runBackend(res) {
//     // Run the command to kill the processes listening on ports 8000 and 3003
//     const killCmd = `sudo kill $(sudo lsof -t -i:8000 -i:3003)`;
//     exec(killCmd, (err, stdout, stderr) => {
//         if (err) {
//             console.error(err);
//             res.status(500).json({ status: false, error: err });
//             return;
//         }
//         // Run the command to start the backend
//         const startCmd = `npm run delete-all && npm start`;
//         exec(startCmd, (err, stdout, stderr) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ status: false, error: err });
//             }
//             return res.status(200).json({ status: true, message: "Backend Restarted" });
//         });
//     });
// };

// module.exports = { runBackend };


const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function runBackend(res) {
    try {
        // Run the command to kill the processes listening on ports 8000 and 3003
        const killCmd = `sudo kill $(sudo lsof -t -i:8000 -i:3003)`;
        await exec(killCmd);

        // Run the command to start the backend
        const startCmd = `npm run delete-all && npm start`;
        await exec(startCmd);

        return { status: true, message: "Backend Restarted" };
    } catch (err) {
        console.error(err);
        throw err;
    }
};

module.exports = { runBackend }