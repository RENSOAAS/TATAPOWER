import React from 'react';
import Moment from 'moment';

const ShowUnfilteredTable = ({ data }) => {
    
    return (
        <tbody>
            {data && Object.keys(data).map((rows, i) => {
                return (
                    <tr key={i}>
                        <td>{i+1}</td>
                        <td>{data[rows].id}</td>
                        <td>{data[rows].wegid}</td>
                        <td>{data[rows].temperature_1}</td>
                        <td>{data[rows].temperature_2}</td>
                        <td>{data[rows].voltage_1}</td>
                        <td>{data[rows].voltage_2}</td>
                        <td>{data[rows].voltage_3}</td>
                        <td>{data[rows].v12}</td>
                        <td>{data[rows].v23}</td>
                        <td>{data[rows].v31}</td>
                        <td>{data[rows].current_1}</td>
                        <td>{data[rows].current_2}</td>
                        <td>{data[rows].current_3}</td>
                        <td>{data[rows].power_1}</td>
                        <td>{data[rows].frequency}</td>
                        <td>{data[rows].brkon}</td>
                        <td>{data[rows].brkoff}</td>
                        <td>{data[rows].bucalm}</td>
                        <td>{data[rows].sprcha}</td>
                        <td>{data[rows].mogtrp}</td>
                        <td>{data[rows].wtialm}</td>
                        <td>{data[rows].otialm}</td>
                        <td>{data[rows].prvtrp}</td>
                        <td>{data[rows].thdvr}</td>
                        <td>{data[rows].thdvy}</td>
                        <td>{data[rows].thdvb}</td>
                        <td>{data[rows].thdcl1}</td>
                        <td>{data[rows].thdcl2}</td>
                        <td>{data[rows].thdcl3}</td>
                        <td>{data[rows].errcode}</td>
                        <td>{data[rows].log_time && Moment(new Date(data[rows].log_time)).format("DD-MM-YYYY HH:MM:SS A")}</td>
                    </tr>
                );
            })}
        </tbody>
    );
};

export default ShowUnfilteredTable;