const db = require("../Database/db");

const getWegidList = async () => {
    const listOfWegid = await db.manyOrNone(
        'SELECT wegid FROM machines_table ORDER BY wegid'
    );
    const wegidList = listOfWegid.map(({ wegid }) => wegid);
    return wegidList;
};

const getUnfilteredDataForWegid = async (wegid) => {
    const query = `SELECT '${wegid}' AS wegid, * FROM ${wegid} ORDER BY id DESC LIMIT 1`;
    const unfilteredData = await db.manyOrNone(query);
    return unfilteredData;
};

const getFilteredDataForMachine = async (machineName, filteredDateFrom, filteredDateTo) => {
    const query = "SELECT * FROM $1:name WHERE log_time BETWEEN $2 AND $3 ORDER BY id;";
    const data = await db.manyOrNone(query, [machineName.toLowerCase(), filteredDateFrom, filteredDateTo]);
    return { [machineName.toLowerCase()]: data };
};

// Unfiltered data
exports.getUnfilteredData = async (req, res) => {
    const machineName = req.body.selectedMachines;
    try {
        if (machineName === 'all') {
            const wegidList = await getWegidList();
            const unfilteredData = await Promise.all(wegidList.map(getUnfilteredDataForWegid));
            const flattenedData = unfilteredData.flat();
            if (flattenedData.length) {
                return res.status(200).json({ status: true, data: flattenedData });
            }
            return res.status(400).json({ status: false, message: 'Data not found' });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};


// Filtered data
exports.getFilteredData = async (req, res) => {
    const { selectedMachines, filteredDateFrom, filteredDateTo } = req.body;
    try {
        const promises = selectedMachines.map((machineName) =>
            getFilteredDataForMachine(machineName, filteredDateFrom, filteredDateTo)
        );
        const filteredDataArray = await Promise.all(promises);
        const filteredData = filteredDataArray.reduce((accumulator, currentValue) => ({ ...accumulator, ...currentValue }), {});
        if (Object.keys(filteredData).length) {
            return res.status(200).json({ status: true, data: filteredData });
        } else {
            return res.status(500).json({ status: false, message: 'Data not found' });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
