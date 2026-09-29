import React from 'react';
import Moment from 'moment';

const ShowAdminFilteredTable = ({ data }) => {
    let sno = 1;

    const changeTimeStamp = logTime => {
        const date = Moment.utc(logTime);
        const formattedDate = date.tz('Asia/Kolkata').format('DD-MM-YYYY, h:mm:ss A');
        return formattedDate;
    };

    return (
        <tbody>
            {data && Object.keys(data).map((row1, i) => {
                return Object.keys(data[row1]).map((row2, j) => {
                
                    return (
                        <tr key={i + j}>                            
                            <td>{sno++}</td>
                            <td>{data[row1][row2].id}</td>
                            <td>{row1.toUpperCase()}</td>
                            <td>{data[row1][row2].temperature_1}</td>
                            <td>{data[row1][row2].temperature_2}</td>
                            <td>{data[row1][row2].voltage_1}</td>
                            <td>{data[row1][row2].voltage_2}</td>
                            <td>{data[row1][row2].voltage_3}</td>
                            <td>{data[row1][row2].v12}</td>
                            <td>{data[row1][row2].v23}</td>
                            <td>{data[row1][row2].v31}</td>
                            <td>{data[row1][row2].current_1}</td>
                            <td>{data[row1][row2].current_2}</td>
                            <td>{data[row1][row2].current_3}</td>
                            <td>{data[row1][row2].power_1}</td>
                            <td>{data[row1][row2].frequency}</td>
                            <td>{data[row1][row2].apmaxdemand}</td>
                            <td>{data[row1][row2].apmindemand}</td>
                            <td>{data[row1][row2].rpmaxdemand}</td>
                            <td>{data[row1][row2].rpmindemand}</td>
                            <td>{data[row1][row2].appmaxdemand}</td>
                            <td>{data[row1][row2].impactenergy}</td>
                            <td>{data[row1][row2].expactenergy}</td>
                            <td>{data[row1][row2].totactenergy}</td>
                            <td>{data[row1][row2].impreaenergy}</td>
                            <td>{data[row1][row2].expreaenergy}</td>
                            <td>{data[row1][row2].totreaenergy}</td>
                            <td>{data[row1][row2].totappenergy}</td>
                            <td>{data[row1][row2].brkon}</td>
                            <td>{data[row1][row2].brkoff}</td>
                            <td>{data[row1][row2].bucalm}</td>
                            <td>{data[row1][row2].sprcha}</td>
                            <td>{data[row1][row2].mogtrp}</td>
                            <td>{data[row1][row2].wtialm}</td>
                            <td>{data[row1][row2].otialm}</td>
                            <td>{data[row1][row2].prvtrp}</td>
                            <td>{data[row1][row2].thdvr}</td>
                            <td>{data[row1][row2].thdvy}</td>
                            <td>{data[row1][row2].thdvb}</td>
                            <td>{data[row1][row2].thdcl1}</td>
                            <td>{data[row1][row2].thdcl2}</td>
                            <td>{data[row1][row2].thdcl3}</td>
                            <td>{data[row1][row2].errcode}</td>
                            <td>{changeTimeStamp(data[row1][row2].log_time)}</td>
                        </tr>
                    )
                })
            })}
        </tbody>
    );
};

export default ShowAdminFilteredTable;