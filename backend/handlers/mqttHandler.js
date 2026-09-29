const fs = require('fs');
const path = require('path');
const Moment = require("moment");
const db = require("../Database/db");
const logger = require("../controllers/logger")
const http = require('http');
const https = require('https');
const certDir = process.env.SSL_CERT_DIR || '/etc/letsencrypt/live/tatapower.esys.co.in';
const keyPath = path.join(certDir, 'privkey.pem');
const certPath = path.join(certDir, 'fullchain.pem');
const useTls = fs.existsSync(keyPath) && fs.existsSync(certPath);

const socketServer = useTls
    ? https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) })
    : http.createServer();
socketServer.listen(process.env.SOCKET_PORT || 3003);

const io = require("socket.io")(socketServer, {
    cors: {
        origin: '*'
    }
});

// ----------MQTT----------
const mqtt = require('mqtt');

const configFile = path.join(__dirname, '../configHandlers/mqttConfig.json');
const mqttConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const { PORT, HOST, USERNAME, PASSWORD, PROTOCOL } = mqttConfig

const options = {
    port: PORT,
    host: HOST,
    username: USERNAME,
    password: PASSWORD,
    protocol: PROTOCOL
};

const client = mqtt.connect(options);

client.on('connect', function () {
    console.log("MQTT Connected");
    client.subscribe('TP/TMS/CBE', function (err) {
        if (err) {
            logger.log({ level: 'error', message: `MQTT subscribe failed: ${err.message}` });
        } else {
            console.log("Subscribed to TP/TMS/CBE");
        }
    });
});

// Without this, a connection failure (bad credentials, broker unreachable,
// network drop) throws an unhandled 'error' event and crashes the process,
// silently killing all incoming readings until something restarts it.
client.on('error', function (err) {
    logger.log({ level: 'error', message: `MQTT client error: ${err.message}` });
});

client.on('reconnect', function () {
    logger.log({ level: 'error', message: 'MQTT reconnecting' });
});

client.on('offline', function () {
    logger.log({ level: 'error', message: 'MQTT client offline' });
});

const optionalNumber = (value) => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n.toFixed(2) : null;
};

const negatePower = (value) => {
    let newValue = parseFloat(value).toFixed(2)
    return Math.abs(newValue)
}

// Real transformer readings never come close to these bounds. A field
// exceeding them is corrupted data (a sensor/communication fault on the
// device), not a legitimate reading, no matter how the device labels it.
// These are tightened to the fleet's actual observed ranges (voltage ~19-35kV,
// current under a few hundred amps, power/demand under a few thousand kW/kVA)
// rather than loosely guessed bounds - the loose bounds let some corrupted
// values (e.g. power_1 in the hundreds of thousands) through as "plausible".
const ANALOG_FIELD_LIMITS = {
    temperature_1: 200,
    temperature_2: 200,
    voltage_1: 50000,
    voltage_2: 50000,
    voltage_3: 50000,
    v12: 50000,
    v23: 50000,
    v31: 50000,
    current_1: 1000,
    current_2: 1000,
    current_3: 1000,
    power_1: 10000,
    frequency: 100,
    ap_max_demand: 10000,
    ap_min_demand: 10000,
    rp_max_demand: 10000,
    rp_min_demand: 10000,
    app_max_demand: 10000,
    imp_act_energy: 1e9,
    exp_act_energy: 1e9,
    tot_act_energy: 1e9,
    imp_rea_energy: 1e9,
    exp_rea_energy: 1e9,
    tot_rea_energy: 1e9,
    tot_app_energy: 1e9,

    // Digital/enumerated fields - genuinely 0/1 or single-digit percentages,
    // but proved just as vulnerable to the same corruption as the analog
    // ones (e.g. THDVB and THDCL2 have been seen at -100,000,000+).
    brk_on: 10,
    brk_off: 10,
    buc_alm: 10,
    spr_cha: 10,
    mog_trp: 10,
    wti_alm: 10,
    oti_alm: 10,
    prv_trp: 10,
    thd_vr: 1000,
    thd_vy: 1000,
    thd_vb: 1000,
    thd_cl1: 1000,
    thd_cl2: 1000,
    thd_cl3: 1000,
    err_code: 1000,
    str_db: 1000
};

// The fields that actually indicate a live, working electrical reading. A
// device with a single broken sensor (e.g. a winding-temperature probe
// permanently stuck at NaN) still has something real and current to show -
// only treat the whole reading as stale when the core measurement itself
// is corrupted, otherwise one dead sensor would freeze the "Last Data At"
// time for that machine forever.
const CORE_FIELDS = new Set([
    'voltage_1', 'voltage_2', 'voltage_3',
    'v12', 'v23', 'v31',
    'current_1', 'current_2', 'current_3',
    'power_1', 'frequency'
]);

// What the dashboard's "Communication Error" count is based on: a machine
// whose latest message didn't have a usable voltage reading.
const VOLTAGE_FIELDS = new Set(['voltage_1', 'voltage_2', 'voltage_3', 'v12', 'v23', 'v31']);

async function updateCommunicationStatus(wegid, hasError) {
    try {
        await db.none(
            `INSERT INTO machine_communication_status (wegid, has_error, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (wegid) DO UPDATE SET has_error = EXCLUDED.has_error, updated_at = NOW()`,
            [wegid, hasError]
        );
    } catch (e) {
        logger.log({ level: 'error', message: `Failed to update communication status: ${e.message}`, wegid });
    }
}

// Per-machine cache of the last plausible value seen for each analog field,
// so a corrupted field can be individually replaced with its own last-good
// value rather than throwing away the whole message (other fields, like
// temperature or alarm bits, might be perfectly fine even when voltage/
// current/power are garbage).
const lastGoodFields = {};
const lastGoodTimestamp = {};
const seededFromDb = {};

async function getFieldCache(wegid) {
    if (!lastGoodFields[wegid]) lastGoodFields[wegid] = {};
    if (!seededFromDb[wegid]) {
        seededFromDb[wegid] = true;
        try {
            const row = await db.oneOrNone(
                `SELECT * FROM $1:name ORDER BY log_time DESC LIMIT 1`,
                [wegid.toLowerCase()]
            );
            if (row) {
                const asLiveData = dbRowToLiveData(wegid, row);
                Object.keys(ANALOG_FIELD_LIMITS).forEach((field) => {
                    const value = asLiveData[field];
                    if (value === undefined || value === null) return;
                    // The database can itself contain a stored NaN/overflow
                    // value (older rows, or a Postgres numeric column that
                    // literally accepts "NaN") - only seed the cache with
                    // values that are actually plausible themselves.
                    const n = Number(value);
                    const max = ANALOG_FIELD_LIMITS[field];
                    const negativeNotAllowed = n < 0 && !FIELDS_ALLOWING_NEGATIVE.has(field);
                    if (Number.isFinite(n) && Math.abs(n) <= max && !negativeNotAllowed) {
                        lastGoodFields[wegid][field] = value;
                    }
                });
                lastGoodTimestamp[wegid] = asLiveData.last_data_sent_at;
            }
        } catch (e) {
            // Table doesn't exist yet for this wegid - nothing to seed from.
        }
    }
    return lastGoodFields[wegid];
}

// Minimum-demand readings are legitimately negative in real payloads (e.g.
// "RPMINDEMAND":"-122.58"). Every other field here should only ever be zero
// or positive - voltage, current, temperature, energy totals etc. going
// negative is itself a sign of corruption, even at a small, plausible-looking
// magnitude.
const FIELDS_ALLOWING_NEGATIVE = new Set(['ap_min_demand', 'rp_min_demand']);

// Returns the field's value if plausible (and remembers it as the new
// "last good" value), otherwise the cached last-good value for that field,
// or "0.00" if this field has never once had a valid reading to fall back to.
function sanitizeField(cache, field, rawValue) {
    const max = ANALOG_FIELD_LIMITS[field];
    if (max === undefined) return { value: rawValue, corrupted: false };

    const n = Number(rawValue);
    const negativeNotAllowed = n < 0 && !FIELDS_ALLOWING_NEGATIVE.has(field);
    if (Number.isFinite(n) && Math.abs(n) <= max && !negativeNotAllowed) {
        cache[field] = rawValue;
        return { value: rawValue, corrupted: false };
    }
    return { value: cache[field] !== undefined ? cache[field] : "0.00", corrupted: true };
}

// Maps a stored database row back into the same shape the live socket event
// uses, so it can stand in for a corrupted live reading.
function dbRowToLiveData(wegid, row) {
    return {
        temperature_1: row.temperature_1,
        temperature_2: row.temperature_2,
        voltage_1: row.voltage_1,
        voltage_2: row.voltage_2,
        voltage_3: row.voltage_3,
        v12: row.v12,
        v23: row.v23,
        v31: row.v31,
        power_1: row.power_1,
        current_1: row.current_1,
        current_2: row.current_2,
        current_3: row.current_3,
        frequency: row.frequency,
        macid: row.mac_address,
        wegid,
        brk_on: row.brkon,
        brk_off: row.brkoff,
        buc_alm: row.bucalm,
        spr_cha: row.sprcha,
        mog_trp: row.mogtrp,
        wti_alm: row.wtialm,
        oti_alm: row.otialm,
        prv_trp: row.prvtrp,
        thd_vr: row.thdvr,
        thd_vy: row.thdvy,
        thd_vb: row.thdvb,
        thd_cl1: row.thdcl1,
        thd_cl2: row.thdcl2,
        thd_cl3: row.thdcl3,
        err_code: row.errcode,
        ap_max_demand: row.apmaxdemand,
        ap_min_demand: row.apmindemand,
        rp_max_demand: row.rpmaxdemand,
        rp_min_demand: row.rpmindemand,
        app_max_demand: row.appmaxdemand,
        imp_act_energy: row.impactenergy,
        exp_act_energy: row.expactenergy,
        tot_act_energy: row.totactenergy,
        imp_rea_energy: row.impreaenergy,
        exp_rea_energy: row.expreaenergy,
        tot_rea_energy: row.totreaenergy,
        tot_app_energy: row.totappenergy,
        last_data_sent_at: Moment(row.log_time).format("DD/MM/YYYY h:mm:ss a")
    };
}


client.on('message', async function (topic, message) {
    if (process.env.MQTT_DEBUG) {
        console.log(`[MQTT DEBUG] topic=${topic} payload=${message.toString().slice(0, 1000)}`);
    }
    let mqttData;
    const rawData = message.toString();
    try {
        mqttData = JSON.parse(rawData);
    } catch (e) {
        // A truncated payload (e.g. a device buffer overflow) still usually
        // has "wegid" intact near the start, well before the cutoff point.
        // Recovering it lets this message fall through the normal handling
        // below instead of vanishing outright - every field will correctly
        // come back as corrupted and get the same fallback treatment as a
        // message that parsed but had garbage values.
        const wegidMatch = rawData.match(/"wegid"\s*:\s*"([^"]*)"/);
        if (wegidMatch) {
            logger.log({
                level: 'error',
                message: `MQTT payload on topic "${topic}" was truncated/invalid JSON, but recovered wegid`,
                wegid: wegidMatch[1],
                data: rawData.slice(0, 500)
            });
            mqttData = { wegid: wegidMatch[1] };
        } else {
            logger.log({
                level: 'error',
                message: `MQTT payload on topic "${topic}" was not valid JSON: ${e.message}`,
                data: rawData.slice(0, 500)
            });
            return;
        }
    }

    if (!mqttData.wegid) {
        // The most common real-world cause of "no readings showing up": the
        // device's field name for the machine id doesn't match what this
        // handler expects. Logging the actual keys makes the mismatch obvious
        // instead of failing silently.
        logger.log({
            level: 'error',
            message: `MQTT message on topic "${topic}" has no wegid field, ignoring it`,
            data: `keys received: ${Object.keys(mqttData).join(', ')}`
        });
        return;
    }

    try {
        // Destructuring data for further use
        const {
            temperature1,
            temperature2,

            voltage1,
            voltage2,
            voltage3,
        
            V12,
            V23,
            V31,
        
            power1,

            current1,
            current2,
            current3,

            frequency,

            macid,
            wegid,

            BRKON,
            BRKOFF,
            BUCALM,
            SPRCHA,
            MOGTRP,
            WTIALM,
            OTIALM,
            PRVTRP,

            APMAXDEMAND,
            APMINDEMAND,
            RPMAXDEMAND,
            RPMINDEMAND,
            APPMAXDEMAND,
            IMPACTENERGY,
            EXPACTENERGY,
            TOTACTENERGY,
            IMPREAENERGY,
            EXPREAENERGY,
            TOTREAENERGY,
            TOTAPPENERGY,

            THDVR,
            THDVY,
            THDVB,
            THDCL1,
            THDCL2,
            THDCL3,
            ERRCODE,
		
            STRDB
        } = mqttData;

        const rawFields = {
            temperature_1: parseFloat(temperature1).toFixed(2),
            temperature_2: parseFloat(temperature2).toFixed(2),
            voltage_1: parseFloat(voltage1 / 1000).toFixed(2),
            voltage_2: parseFloat(voltage2 / 1000).toFixed(2),
            voltage_3: parseFloat(voltage3 / 1000).toFixed(2),
            v12: parseFloat(V12 / 1000).toFixed(2),
            v23: parseFloat(V23 / 1000).toFixed(2),
            v31: parseFloat(V31 / 1000).toFixed(2),
            power_1: negatePower(power1),
            current_1: parseFloat(current1).toFixed(2),
            current_2: parseFloat(current2).toFixed(2),
            current_3: parseFloat(current3).toFixed(2),
            frequency: parseFloat(frequency).toFixed(2),
            ap_max_demand: optionalNumber(APMAXDEMAND),
            ap_min_demand: optionalNumber(APMINDEMAND),
            rp_max_demand: optionalNumber(RPMAXDEMAND),
            rp_min_demand: optionalNumber(RPMINDEMAND),
            app_max_demand: optionalNumber(APPMAXDEMAND),
            imp_act_energy: optionalNumber(IMPACTENERGY),
            exp_act_energy: optionalNumber(EXPACTENERGY),
            tot_act_energy: optionalNumber(TOTACTENERGY),
            imp_rea_energy: optionalNumber(IMPREAENERGY),
            exp_rea_energy: optionalNumber(EXPREAENERGY),
            tot_rea_energy: optionalNumber(TOTREAENERGY),
            tot_app_energy: optionalNumber(TOTAPPENERGY),

            brk_on: BRKON,
            brk_off: BRKOFF,
            buc_alm: BUCALM,
            spr_cha: SPRCHA,
            mog_trp: MOGTRP,
            wti_alm: WTIALM,
            oti_alm: OTIALM,
            prv_trp: PRVTRP,
            thd_vr: THDVR,
            thd_vy: THDVY,
            thd_vb: THDVB,
            thd_cl1: THDCL1,
            thd_cl2: THDCL2,
            thd_cl3: THDCL3,
            err_code: ERRCODE,
            str_db: STRDB
        };

        // Replace any individual field that's outside physical reason (a
        // sensor/communication fault on the device) with that field's own
        // last plausible value, instead of throwing away the whole message.
        // Fields like temperature or alarm bits often stay fine even when
        // voltage/current/power go haywire, so this keeps showing whatever
        // is genuinely still working.
        const fieldCache = await getFieldCache(wegid);
        const sanitized = {};
        const corruptedFieldNames = [];
        const corruptedFieldDetails = [];
        Object.keys(rawFields).forEach((field) => {
            const { value, corrupted } = sanitizeField(fieldCache, field, rawFields[field]);
            sanitized[field] = value;
            if (corrupted) {
                corruptedFieldNames.push(field);
                corruptedFieldDetails.push(`${field}=${rawFields[field]}`);
            }
        });
        const anyCorrupted = corruptedFieldNames.length > 0;
        const coreCorrupted = corruptedFieldNames.some((field) => CORE_FIELDS.has(field));

        // Voltage counts as "missing" either because a value failed the
        // sanity check, or because all three line voltages the dashboard
        // actually displays (V12/V23/V31 - the R/Y/B columns) read exactly
        // 0.00. A literal zero passes the sanity bounds fine, but a live,
        // connected transformer never reads zero - that's a dead/disconnected
        // sensor, not a legitimate reading.
        const voltageCorrupted = corruptedFieldNames.some((field) => VOLTAGE_FIELDS.has(field));
        const allLineVoltagesZero = ['v12', 'v23', 'v31'].every((field) => Number(sanitized[field]) === 0);
        const voltageMissing = voltageCorrupted || allLineVoltagesZero;
        updateCommunicationStatus(wegid, voltageMissing);

        if (anyCorrupted) {
            logger.log({
                level: 'error',
                message: `Corrupted field(s) from wegid "${wegid}" replaced with last known good value`,
                wegid,
                data: corruptedFieldDetails.join(', ')
            });
        }

        let displayTimestamp;
        if (coreCorrupted) {
            // Only treat the reading itself as stale when the actual
            // electrical measurement is corrupted - show the time that
            // substituted core data actually came from instead. If this
            // machine has never once had a good core reading, there's no
            // real "last good time" to preserve, so just show now - the
            // device did report in this moment, even though its values
            // are being shown as the 0.00 placeholder above.
            displayTimestamp = lastGoodTimestamp[wegid] || Moment(new Date()).format("DD/MM/YYYY h:mm:ss a");
        } else {
            // The device is genuinely reporting a live reading right now,
            // even if a secondary field (e.g. one temperature sensor) has a
            // standing fault and is being substituted above.
            displayTimestamp = Moment(new Date()).format("DD/MM/YYYY h:mm:ss a");
            lastGoodTimestamp[wegid] = displayTimestamp;
        }

        const liveData = {
            ...sanitized,

            macid: macid,
            wegid: wegid,

            last_data_sent_at: displayTimestamp
        };

        // Socket streaming the data to frontend
        io.emit("recieve-temp", { data: liveData });

        if (anyCorrupted) {
            // Don't persist a row built from substituted values - it would
            // also fail on insert anyway for the fields still out of range
            // (e.g. energy counters with no prior good value to fall back to).
            return;
        }

        // Stores data into database
        checkTableList(wegid.toLowerCase())
            .then(tableExist => {
                if (tableExist) {
                    return storeIntoDb(mqttData)
                }
                // A message arrived for a wegid that was never registered via
                // Register Machine (or is registered under a different
                // spelling/case). Its readings are otherwise dropped silently.
                logger.log({
                    level: 'error',
                    message: `No table exists for wegid "${wegid}" - register this machine first`,
                    wegid
                });
            })
            .catch(e => {
                logger.log({ level: 'error', message: `DB insert failed: ${e.message}`, wegid });
            })
    } catch (e) {
        logger.log({
            level: 'error',
            message: `Failed to process MQTT message on topic "${topic}": ${e.message}`,
            wegid: mqttData.wegid
        });
    }
});

client.on('close', function () {
    logger.log({
        level: 'error',
        message: 'Communication Down',
    });
})
// ----------MQTT----------

// -------------------------------------------------------------------------------------
// Check for the table in db
async function checkTableList(wegid) {
    try {
        const tables = await db.many(
            "SELECT table_name FROM information_schema.tables"
        );
        
        const checkForWegidTable = tables.filter(
            (name) => name.table_name === `${wegid}`
        );

        if (!checkForWegidTable[0]) return false;
        else return true;
    } catch (e) {
        return false;
    }
}
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// Store into db
let wegidTimestamps = {};

async function storeIntoDb(data) {
    // Destructuring the data values
    const {
        temperature1,
        temperature2,

        voltage1,
        voltage2,
        voltage3,
        
        V12,
        V23,
        V31,
        
        power1,

        current1,
        current2,
        current3,

        frequency,

        macid,
        wegid,

        BRKON,
        BRKOFF,
        BUCALM,
        SPRCHA,
        MOGTRP,
        WTIALM,
        OTIALM,
        PRVTRP,

        APMAXDEMAND,
        APMINDEMAND,
        RPMAXDEMAND,
        RPMINDEMAND,
        APPMAXDEMAND,
        IMPACTENERGY,
        EXPACTENERGY,
        TOTACTENERGY,
        IMPREAENERGY,
        EXPREAENERGY,
        TOTREAENERGY,
        TOTAPPENERGY,

        THDVR,
        THDVY,
        THDVB,
        THDCL1,
        THDCL2,
        THDCL3,
        ERRCODE
    } = data;

    let currentTime = new Date().getTime();
    if (!wegidTimestamps[wegid] || (currentTime - wegidTimestamps[wegid]) >= 10 * 60 * 1000) {
        
        // Log voltage if error
        checkVoltage(V12, 'V12', wegid);
        checkVoltage(V23, 'V23', wegid);
        checkVoltage(V31, 'V31', wegid);
        // Log temperature if error
        checkTemperature(temperature1, 'oil', wegid);
        checkTemperature(temperature2, 'winding', wegid);
        // Log current if error
        checkCurrent(current1, current2, current3, wegid);
        // Log alarms if error
        checkAlarms(BRKON, BRKOFF, BUCALM, SPRCHA, MOGTRP, WTIALM, OTIALM, PRVTRP, wegid);

        await db.none(
            `INSERT INTO $1:name (
                    temperature_1,
                    temperature_2,
                    voltage_1,
                    voltage_2,
                    voltage_3,
                    V12,
                    V23,
                    V31,
                    current_1,
                    current_2,
                    current_3,
                    power_1,
                    frequency,
                    mac_address,
                    BRKON,
                    BRKOFF,
                    BUCALM,
                    SPRCHA,
                    MOGTRP,
                    WTIALM,
                    OTIALM,
                    PRVTRP,
                    THDVR,
                    THDVY,
                    THDVB,
                    THDCL1,
                    THDCL2,
                    THDCL3,
                    ERRCODE,
                    APMAXDEMAND,
                    APMINDEMAND,
                    RPMAXDEMAND,
                    RPMINDEMAND,
                    APPMAXDEMAND,
                    IMPACTENERGY,
                    EXPACTENERGY,
                    TOTACTENERGY,
                    IMPREAENERGY,
                    EXPREAENERGY,
                    TOTREAENERGY,
                    TOTAPPENERGY
                ) VALUES($2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42);`,
            [
                wegid.toLowerCase(),
                parseFloat(temperature1).toFixed(2),
                parseFloat(temperature2).toFixed(2),
                parseFloat(voltage1 / 1000).toFixed(2),
                parseFloat(voltage2 / 1000).toFixed(2),
                parseFloat(voltage3 / 1000).toFixed(2),
                parseFloat(V12 / 1000).toFixed(2),
                parseFloat(V23 / 1000).toFixed(2),
                parseFloat(V31 / 1000).toFixed(2),
                parseFloat(current1).toFixed(2),
                parseFloat(current2).toFixed(2),
                parseFloat(current3).toFixed(2),
                negatePower(power1),
                parseFloat(frequency).toFixed(2),
                macid,
                parseInt(BRKON),
                parseInt(BRKOFF),
                parseInt(BUCALM),
                parseInt(SPRCHA),
                parseInt(MOGTRP),
                parseInt(WTIALM),
                parseInt(OTIALM),
                parseInt(PRVTRP),
                parseInt(THDVR),
                parseInt(THDVY),
                parseInt(THDVB),
                parseInt(THDCL1),
                parseInt(THDCL2),
                parseInt(THDCL3),
                parseInt(ERRCODE),
                APMAXDEMAND,
                APMINDEMAND,
                RPMAXDEMAND,
                RPMINDEMAND,
                APPMAXDEMAND,
                IMPACTENERGY,
                EXPACTENERGY,
                TOTACTENERGY,
                IMPREAENERGY,
                EXPREAENERGY,
                TOTREAENERGY,
                TOTAPPENERGY
            ]
        );

        wegidTimestamps[wegid] = currentTime;
    }
}
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// Error logging
// ================= Voltage Checks ===================
function checkVoltage(voltage, type, wegid) {
    const voltageLimits = {
        min: 30000,
        max: 35000
    };

    if (voltage < voltageLimits.min) {
        logger.log({
            level: 'error',
            message: `Voltage ${type} less than ${voltageLimits.min / 1000}KV.`,
            wegid: wegid,
            data: voltage
        });
    }

    if (voltage > voltageLimits.max) {
        logger.log({
            level: 'error',
            message: `Voltage ${type} Greater than ${voltageLimits.max / 1000}KV.`,
            wegid: wegid,
            data: voltage
        });
    }
}

// ================= Temperature Checks ===================
function checkTemperature(temperature, type, wegid) {
    const temperatureLimits = {
        oil: 65,
        winding: 65
    };

    if (temperature > temperatureLimits[type]) {
        logger.log({
            level: 'error',
            message: `${type} Temperature HIGH`,
            wegid: wegid,
            data: temperature
        });
    }
}

// ================= Current Checks ===================
function checkCurrent(current1, current2, current3, wegid) {
    if (
        (current1 === 0 && current2 > 0.35 && current3 > 0.35) ||
        (current2 === 0 && current1 > 0.35 && current3 > 0.35) ||
        (current3 === 0 && current1 > 0.35 && current2 > 0.35)) {
        logger.log({
            level: 'error',
            message: 'Phase Current Zero',
            wegid: wegid
        });
    }
}

// ================= Alarms Checks ===================
function checkAlarms(BRKON, BRKOFF, BUCALM, SPRCHA, MOGTRP, WTIALM, OTIALM, PRVTRP, wegid) {
    if (BRKON === 0) {
        logger.log({
            level: 'error',
            message: 'BRKON LOW',
            wegid: wegid,
            data: BRKON
        });
    }

    if (BRKOFF === 1) {
        logger.log({
            level: 'info',
            message: 'BRKOFF HIGH',
            wegid: wegid,
            data: BRKOFF
        });
    }

    if (BUCALM === 1) {
        logger.log({
            level: 'info',
            message: 'BUCTRP HIGH',
            wegid: wegid,
            data: BUCALM
        });
    }

    if (SPRCHA === 0) {
        logger.log({
            level: 'error',
            message: 'SP CRGD LOW',
            wegid: wegid,
            data: SPRCHA
        });
    }

    if (MOGTRP === 1) {
        logger.log({
            level: 'info',
            message: 'MOGALM HIGH',
            wegid: wegid,
            data: MOGTRP
        });
    }

    if (WTIALM === 1) {
        logger.log({
            level: 'info',
            message: 'WTIALM HIGH',
            wegid: wegid,
            data: WTIALM
        });
    }

    if (OTIALM === 1) {
        logger.log({
            level: 'info',
            message: 'OTIALM HIGH',
            wegid: wegid,
            data: OTIALM
        });
    }

    if (PRVTRP === 1) {
        logger.log({
            level: 'info',
            message: 'PRVTRP HIGH',
            wegid: wegid,
            data: PRVTRP
        });
    }
}
// -------------------------------------------------------------------------------------
