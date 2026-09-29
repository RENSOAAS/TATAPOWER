const db = require("../Database/db");

exports.getCommunicationErrors = async (req, res) => {
    try {
        // Only ever flag machines that are actually registered - a garbled
        // MQTT message can produce a bogus, non-machine "wegid" (e.g. a
        // stray "{" recovered from a badly corrupted payload), and that
        // shouldn't show up here as if it were a real device.
        const flaggedRows = await db.manyOrNone(
            `SELECT s.wegid, s.updated_at FROM machine_communication_status s
             INNER JOIN machines_table m ON m.wegid = s.wegid
             WHERE s.has_error = true`
        );

        // A machine that hasn't sent a single message since the backend
        // started has no row here at all - it never got the chance to be
        // flagged, but its voltage isn't showing on the dashboard either,
        // so it belongs in this list just as much as one with a corrupted
        // latest reading.
        const neverReportedRows = await db.manyOrNone(
            `SELECT m.wegid FROM machines_table m
             LEFT JOIN machine_communication_status s ON s.wegid = m.wegid
             WHERE s.wegid IS NULL`
        );

        const allRows = [
            ...flaggedRows,
            ...neverReportedRows.map((r) => ({ wegid: r.wegid, updated_at: null }))
        ].sort((a, b) => a.wegid.localeCompare(b.wegid));

        const machines = await Promise.all(
            allRows.map(async (row) => {
                let lastValidReading = null;
                try {
                    lastValidReading = await db.oneOrNone(
                        `SELECT log_time, voltage_1, voltage_2, voltage_3, v12, v23, v31,
                                current_1, current_2, current_3, power_1, frequency,
                                temperature_1, temperature_2
                         FROM $1:name ORDER BY log_time DESC LIMIT 1`,
                        [row.wegid.toLowerCase()]
                    );
                } catch (e) {
                    // No table for this wegid yet - it has never stored a valid reading.
                }
                return {
                    wegid: row.wegid,
                    sinceInvalid: row.updated_at,
                    lastValidReading
                };
            })
        );

        return res.status(200).json({
            status: true,
            count: machines.length,
            machines
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
