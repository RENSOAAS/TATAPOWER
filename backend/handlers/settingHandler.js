const db = require("../Database/db");

exports.getMachines = async (req, res) => { 
    try {
        await db.manyOrNone(
            "SELECT id, wegid, state, district, area, sub_area, feeder_number, iot_sim_number, device_id FROM machines_table ORDER BY id"
        ).then(result => {
            return res.status(200).json({ status: true, machines: result });
        })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

exports.updateMachineDetails = async (req, res) => {
    const { id, state, district, area, sub_area, feeder_number, iot_sim_number, device_id } = req.body;
    
    try {
        await db.manyOrNone(
            `UPDATE machines_table 
            SET state=$1,
            district=$2,
            area=$3,
            sub_area=$4,
            feeder_number=$5,
            iot_sim_number=$6,
            device_id=$7
            WHERE id=$8`,
            [state, district, area, sub_area, feeder_number, iot_sim_number, device_id, id]
        );

        return res.status(200).json({ status: true, message: "Machine updated successfully" });

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

exports.removeMachine = async (req, res) => {
    const { id, wegid } = req.body;

    try {
        await db.manyOrNone("DELETE FROM machines_table WHERE id=$1", [id]);

        // Drop the table dynamically
        const dropTableQuery = `DROP TABLE IF EXISTS ${wegid}`;
        await db.none(dropTableQuery);

        return res
            .status(200)
            .json({ status: true, message: "Machine's Data and table deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};