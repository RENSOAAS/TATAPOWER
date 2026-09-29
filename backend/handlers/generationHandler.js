const db = require("../Database/db");

// Energy registers (TOTACTENERGY) are cumulative counters, so the amount
// generated in a period is the latest reading minus the reading nearest
// to the start of that period.
async function getEnergyDelta(wegid, sinceDate) {
    const table = wegid.toLowerCase();

    const latest = await db.oneOrNone(
        `SELECT totactenergy, log_time FROM $1:name ORDER BY log_time DESC LIMIT 1`,
        [table]
    );
    if (!latest || latest.totactenergy === null) return null;

    const beforeBoundary = await db.oneOrNone(
        `SELECT totactenergy FROM $1:name WHERE log_time <= $2 ORDER BY log_time DESC LIMIT 1`,
        [table, sinceDate]
    );
    const afterBoundary = await db.oneOrNone(
        `SELECT totactenergy FROM $1:name WHERE log_time >= $2 ORDER BY log_time ASC LIMIT 1`,
        [table, sinceDate]
    );

    const latestValue = parseFloat(latest.totactenergy);

    // A register that reads lower than an earlier reading means the meter
    // (or, in this demo, the simulator) was reset. Falling back to the
    // first reading inside the period avoids reporting a negative total.
    if (beforeBoundary && beforeBoundary.totactenergy !== null) {
        const delta = latestValue - parseFloat(beforeBoundary.totactenergy);
        if (delta >= 0) return delta;
    }

    if (afterBoundary && afterBoundary.totactenergy !== null) {
        const delta = latestValue - parseFloat(afterBoundary.totactenergy);
        return delta > 0 ? delta : 0;
    }

    return null;
}

function periodBoundaries() {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return { dayStart, monthStart, yearStart };
}

// Formats using local calendar date parts, not toISOString() - that converts
// to UTC first, which rolls local midnight back a day in timezones ahead of
// UTC (e.g. IST), silently mislabeling every period_start by one day.
const toDateOnly = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

// Saves the current day/month/year totals so they survive even after the raw
// per-reading rows they were computed from get purged. Only the row for the
// period still in progress is touched, so once a day/month/year ends, its
// final value is simply left alone - an automatic historical record with no
// separate cron job needed.
async function persistGenerationSummary(entries) {
    const rows = entries.filter((e) => e.energyKwh !== null);
    if (!rows.length) return;

    const values = rows
        .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
        .join(", ");
    const params = rows.flatMap((r) => [r.wegid, r.periodType, r.periodStart, r.energyKwh]);

    await db.none(
        `INSERT INTO generation_summary (wegid, period_type, period_start, energy_kwh)
         VALUES ${values}
         ON CONFLICT (wegid, period_type, period_start)
         DO UPDATE SET energy_kwh = EXCLUDED.energy_kwh, updated_at = NOW()`,
        params
    );
}

async function getSummaryForWegid(wegid) {
    const { dayStart, monthStart, yearStart } = periodBoundaries();
    const [day, month, year] = await Promise.all([
        getEnergyDelta(wegid, dayStart),
        getEnergyDelta(wegid, monthStart),
        getEnergyDelta(wegid, yearStart)
    ]);
    return { day, month, year };
}

exports.getGenerationSummary = async (req, res) => {
    const { wegid } = req.body;
    const { dayStart, monthStart, yearStart } = periodBoundaries();
    try {
        if (!wegid || wegid === "all") {
            const wegidList = (
                await db.manyOrNone("SELECT wegid FROM machines_table ORDER BY wegid")
            ).map((row) => row.wegid);

            const summaries = await Promise.all(
                wegidList.map((id) =>
                    getSummaryForWegid(id).catch(() => ({ day: null, month: null, year: null }))
                )
            );

            const total = summaries.reduce(
                (acc, s) => ({
                    day: acc.day + (s.day || 0),
                    month: acc.month + (s.month || 0),
                    year: acc.year + (s.year || 0)
                }),
                { day: 0, month: 0, year: 0 }
            );

            const machines = {};
            wegidList.forEach((id, i) => {
                machines[id] = summaries[i].day === null ? null : Number(summaries[i].day.toFixed(2));
            });

            const persistEntries = [];
            wegidList.forEach((id, i) => {
                const s = summaries[i];
                persistEntries.push(
                    { wegid: id, periodType: "day", periodStart: toDateOnly(dayStart), energyKwh: s.day },
                    { wegid: id, periodType: "month", periodStart: toDateOnly(monthStart), energyKwh: s.month },
                    { wegid: id, periodType: "year", periodStart: toDateOnly(yearStart), energyKwh: s.year }
                );
            });
            persistEntries.push(
                { wegid: "ALL", periodType: "day", periodStart: toDateOnly(dayStart), energyKwh: Number(total.day.toFixed(2)) },
                { wegid: "ALL", periodType: "month", periodStart: toDateOnly(monthStart), energyKwh: Number(total.month.toFixed(2)) },
                { wegid: "ALL", periodType: "year", periodStart: toDateOnly(yearStart), energyKwh: Number(total.year.toFixed(2)) }
            );
            persistGenerationSummary(persistEntries).catch((e) => console.error("Failed to persist generation summary:", e.message));

            return res.status(200).json({
                status: true,
                data: {
                    day: Number(total.day.toFixed(2)),
                    month: Number(total.month.toFixed(2)),
                    year: Number(total.year.toFixed(2)),
                    machines
                }
            });
        }

        const summary = await getSummaryForWegid(wegid);

        persistGenerationSummary([
            { wegid, periodType: "day", periodStart: toDateOnly(dayStart), energyKwh: summary.day },
            { wegid, periodType: "month", periodStart: toDateOnly(monthStart), energyKwh: summary.month },
            { wegid, periodType: "year", periodStart: toDateOnly(yearStart), energyKwh: summary.year }
        ]).catch((e) => console.error("Failed to persist generation summary:", e.message));

        return res.status(200).json({
            status: true,
            data: {
                day: summary.day === null ? null : Number(summary.day.toFixed(2)),
                month: summary.month === null ? null : Number(summary.month.toFixed(2)),
                year: summary.year === null ? null : Number(summary.year.toFixed(2))
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
