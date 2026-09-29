const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

const myFormat = printf(({ level, message, wegid, timestamp, data }) => {
    return JSON.stringify({ level, message, wegid, timestamp, data });
});

const logger = createLogger({
    format: combine(
        timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        myFormat
    ),

    transports: [
        new DailyRotateFile({
            filename: 'logs/%DATE%.log',
            datePattern: 'DD-MM-YYYY',
            zippedArchive: true,
            level: 'error',
            json: true,
        }),
    ],
});

module.exports = logger;