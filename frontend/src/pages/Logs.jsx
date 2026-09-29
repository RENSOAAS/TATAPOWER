import React, { useEffect, useState } from 'react'
import Layout from '../layout/Layout';
import { API } from "../config";
import "../styles/logs.css"
import "../styles/loader.css"

const Logs = () => {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([])

    useEffect(() => {
        setLoading(true)
        fetch(`${API}/logs`)
            .then(res => res.json())
            .then(data => {
                setLogs(data)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }, []);

    const showLogTable = () => {
        return (
            <div className='logs--container'>
                <table>
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Timestamp</th>
                            <th>Level</th>
                            <th>Wegid</th>
                            <th>Data</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    {loading ?
                        (
                            <tbody>
                                <tr>
                                    <td
                                        colSpan={5}
                                        style={{ placeContent: "center" }}
                                    >
                                        <div className="loader"></div>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {logs && logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map((log, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{log.timestamp}</td>
                                        <td>{log.level}</td>
                                        <td>{log.wegid}</td>
                                        <td>{log.data}</td>
                                        <td>{log.message}</td>
                                    </tr>
                            
                                ))}
                            </tbody>
                        )
                    }
                </table>
            </div>
        )
    }

    return (
        <Layout>{showLogTable()}</Layout>
    )
};

export default Logs;