const db = require("./db");
const bcrypt = require("bcrypt");
require("dotenv").config();

// User related tables
const usersTable = `CREATE TABLE IF NOT EXISTS "users_table"(
    id SERIAL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role INT NOT NULL DEFAULT 0,
    enable_emails BOOLEAN NOT NULL DEFAULT false,
    disable_login BOOLEAN NOT NULL DEFAULT false,
    created_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

// Remaining tables
const machinesTable = `CREATE TABLE IF NOT EXISTS "machines_table"(
    id SERIAL,
    wegid VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    district VARCHAR NOT NULL,
    area VARCHAR NOT NULL,
	sub_area VARCHAR NOT NULL,
	feeder_number INT NOT NULL,
    iot_sim_number VARCHAR,
    device_id VARCHAR,
    created_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

// Stores the generated-energy total for each machine (or "ALL" for the whole
// fleet) per day/month/year, so past totals survive even after raw readings
// are purged by the Delete Old Data feature.
const generationSummaryTable = `CREATE TABLE IF NOT EXISTS "generation_summary"(
    id SERIAL,
    wegid VARCHAR NOT NULL,
    period_type VARCHAR(5) NOT NULL,
    period_start DATE NOT NULL,
    energy_kwh NUMERIC(14,2) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(wegid, period_type, period_start)
);`;

// Tracks whether each machine's most recent MQTT message had a usable
// voltage reading. Updated on every message received, so the dashboard's
// Communication Error count reflects live status without recomputing it
// from raw history on every page load.
const communicationStatusTable = `CREATE TABLE IF NOT EXISTS "machine_communication_status"(
    wegid VARCHAR PRIMARY KEY,
    has_error BOOLEAN NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

async function createTables() {
    try {
        const tables = await db.many(
            "SELECT table_name FROM information_schema.tables"
        );

        // get all table name
        const data = await Promise.all([
            createUsersTable(),
			createMachinesTable(),
            createGenerationSummaryTable(),
            createCommunicationStatusTable(),
        ]);

      //Check whether user table already exists or not
		async function createUsersTable() {
			const checkUsersTable = tables.filter(
				(name) => name.table_name === "users_table"
			);

			if (!checkUsersTable[0]) {
				await db.none(usersTable);
				return "Users Table created Successfully";
			} else {
				return "Users table already exist";
			}
		};

      	// check for remaining tables
		async function createMachinesTable() {
			const checkMachinesTable = tables.filter(
				(name) => name.table_name === "machines_table"
			);

			if (!checkMachinesTable[0]) {
				await db.none(machinesTable);
				return "Machines Table created Successfully";
			} else {
				return "Machines Table already exist";
			}
		};

		async function createGenerationSummaryTable() {
			const checkTable = tables.filter(
				(name) => name.table_name === "generation_summary"
			);

			if (!checkTable[0]) {
				await db.none(generationSummaryTable);
				return "Generation Summary Table created Successfully";
			} else {
				return "Generation Summary Table already exist";
			}
		};

		async function createCommunicationStatusTable() {
			const checkTable = tables.filter(
				(name) => name.table_name === "machine_communication_status"
			);

			if (!checkTable[0]) {
				await db.none(communicationStatusTable);
				return "Machine Communication Status Table created Successfully";
			} else {
				return "Machine Communication Status Table already exist";
			}
		};

        return data;
    } catch (error) {
        return error.message;
    }
};

module.exports = createTables;
