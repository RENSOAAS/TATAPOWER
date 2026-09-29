const moment = require('moment');
const db = require('../Database/db');

const deleteOldDataForTable = async (tableName) => {
    const threeMonthsAgo = moment().subtract(3, 'months').format('YYYY-MM-DD');
    const deleteQuery = `DELETE FROM ${tableName} WHERE log_time < '${threeMonthsAgo}'`;

    try {
        await db.none(deleteQuery);
        console.log(`Data older than three months for table ${tableName} deleted successfully`);
    } catch (error) {
        console.error(`Error deleting data for table ${tableName}:`, error);
    }
};

const getWegidList = async () => {
    try {
        const listOfWegid = await db.manyOrNone('SELECT wegid FROM machines_table ORDER BY wegid');
        const wegidList = listOfWegid.map(({ wegid }) => wegid.toLowerCase()); // Convert to lowercase
        return wegidList;
    } catch (error) {
        console.error('Error fetching wegid list:', error);
        return [];
    }
};

exports.deleteOldData = async (req, res) => {
    try {
        const wegidList = await getWegidList();
    
        // Map each wegid to a promise that deletes old data for the corresponding table
        const deletePromises = wegidList.map((wegid) => deleteOldDataForTable(wegid));
        await Promise.all(deletePromises);

        return res.status(200).json({ status: true, message: 'Old data deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};