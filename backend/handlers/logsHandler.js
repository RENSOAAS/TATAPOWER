const fs = require('fs');
const readline = require('readline');
const moment = require('moment');

const getLogs = (req, res) => {
    const logs = [];
    let count = 0;

    const today = moment().format('DD-MM-YYYY');
    const stream = fs.createReadStream(__dirname + `/logs/${today}.log`);
    const rl = readline.createInterface({ input: stream });

    rl.on('line', line => {
        count++;
        if (count > 50) {
            logs.shift();
        }
        logs.push(JSON.parse(line));
    });

    rl.on('close', () => {
        logs.reverse();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(logs));
    });
};

module.exports = { getLogs };