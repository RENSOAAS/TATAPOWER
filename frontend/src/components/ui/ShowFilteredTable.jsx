import React, { useEffect, useState } from 'react';
import Moment from 'moment-timezone';

const ShowFilteredTable = ({ data }) => {
    const [rowsToShow, setRowsToShow] = useState(50);
    const [showLoadMore, setShowLoadMore] = useState(true);

    const changeTimeStamp = (logTime) => {
        const date = Moment.utc(logTime);
        const formattedDate = date.tz("Asia/Kolkata").format("DD-MM-YYYY, h:mm:ss A");
        return formattedDate;
    };

    const handleLoadMore = () => {
        setRowsToShow(rowsToShow + 50);
    };

    const rows = Object.keys(data).flatMap((row1) =>
        Object.keys(data[row1]).map((row2) => ({
            id: data[row1][row2].id,
            location: row1.toUpperCase(),
            temperature1: data[row1][row2].temperature_1,
            temperature2: data[row1][row2].temperature_2,
            voltage1: data[row1][row2].voltage_1,
            voltage2: data[row1][row2].voltage_2,
            voltage3: data[row1][row2].voltage_3,
            v12: data[row1][row2].v12,
            v23: data[row1][row2].v23,
            v31: data[row1][row2].v31,
            current1: data[row1][row2].current_1,
            current2: data[row1][row2].current_2,
            current3: data[row1][row2].current_3,
            power1: data[row1][row2].power_1,
            frequency: data[row1][row2].frequency,
            brkon: data[row1][row2].brkon,
            brkoff: data[row1][row2].brkoff,
            bucalm: data[row1][row2].bucalm,
            sprcha: data[row1][row2].sprcha,
            mogtrp: data[row1][row2].mogtrp,
            wtialm: data[row1][row2].wtialm,
            otialm: data[row1][row2].otialm,
            prvtrp: data[row1][row2].prvtrp,
            thdvr: data[row1][row2].thdvr,
            thdvy: data[row1][row2].thdvy,
            thdvb: data[row1][row2].thdvb,
            thdcl1: data[row1][row2].thdcl1,
            thdcl2: data[row1][row2].thdcl2,
            thdcl3: data[row1][row2].thdcl3,
            errcode: data[row1][row2].errcode,
            logTime: changeTimeStamp(data[row1][row2].log_time),
        }))
    );

    const visibleRows = rows.slice(0, rowsToShow);

    useEffect(() => {
        if (rowsToShow >= rows.length) {
            setShowLoadMore(false);
        } else {
            setShowLoadMore(true);
        }
    }, [rowsToShow, rows.length]);

    return (
        <tbody>
            {visibleRows.map((row, index) => (
                <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.id}</td>
                    <td>{row.location}</td>
                    <td>{row.temperature1}</td>
                    <td>{row.temperature2}</td>
                    <td>{row.voltage1}</td>
                    <td>{row.voltage2}</td>
                    <td>{row.voltage3}</td>
                    <td>{row.v12}</td>
                    <td>{row.v23}</td>
                    <td>{row.v31}</td>
                    <td>{row.current1}</td>
                    <td>{row.current2}</td>
                    <td>{row.current3}</td>
                    <td>{row.power1}</td>
                    <td>{row.frequency}</td>
                    <td>{row.brkon}</td>
                    <td>{row.brkoff}</td>
                    <td>{row.bucalm}</td>
                    <td>{row.sprcha}</td>
                    <td>{row.mogtrp}</td>
                    <td>{row.wtialm}</td>
                    <td>{row.otialm}</td>
                    <td>{row.prvtrp}</td>
                    <td>{row.thdvr}</td>
                    <td>{row.thdvy}</td>
                    <td>{row.thdvb}</td>
                    <td>{row.thdcl1}</td>
                    <td>{row.thdcl2}</td>
                    <td>{row.thdcl3}</td>
                    <td>{row.errcode}</td>
                    <td>{row.logTime}</td>
                </tr>
            ))}
            {showLoadMore && (
                <tr>
                    <td colSpan="17">
                        <button onClick={handleLoadMore} className='reports--header-button' style={{ marginInline: 'auto' }}>Load More</button>
                    </td>
                </tr>
            )}
        </tbody>
    );
};


export default ShowFilteredTable;