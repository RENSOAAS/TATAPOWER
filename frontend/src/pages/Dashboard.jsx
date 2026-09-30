import React, { useCallback, useEffect, useState } from 'react';
import Layout from "../layout/Layout";
import {API} from "../config";
import Modal from 'react-modal';

import Cards from '../components/ui/Cards';
import "../styles/dashboard.css";
import 'react-toastify/dist/ReactToastify.css';

import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin;
const socket = io(SOCKET_URL, { secure: window.location.protocol === "https:" });

const Dashboard = () => {
    const [bypassedMachines, setBypassedMachines] = useState([]);

    const [listOfMachines, setListOfMachines] = useState([]);
    const [listOfFeederNumber, setListOfFeederNumber] = useState([]);

    // ---------------------------------------------------------------------------
    // Energy generated today / this month / this year, across all machines
    const [generationSummary, setGenerationSummary] = useState({ day: 0, month: 0, year: 0 });

    const fetchGenerationSummary = useCallback(async () => {
        try {
            const res = await fetch(`${API}/fetchGenerationSummary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wegid: "all" })
            });
            const result = await res.json();
            if (result.status) {
                setGenerationSummary(result.data);
            }
        } catch (err) {
            console.log(err);
        }
    }, []);

    useEffect(() => {
        fetchGenerationSummary();
        const interval = setInterval(fetchGenerationSummary, 60000);
        return () => clearInterval(interval);
    }, [fetchGenerationSummary]);
    // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
    // Communication errors: machines whose latest MQTT message had no usable
    // voltage reading. Tracked server-side so the count survives page reloads.
    const [commErrors, setCommErrors] = useState({ count: 0, machines: [] });
    const [showCommErrorModal, setShowCommErrorModal] = useState(false);

    const fetchCommErrors = useCallback(async () => {
        try {
            const res = await fetch(`${API}/communicationErrors`);
            const result = await res.json();
            if (result.status) {
                setCommErrors(result);
            }
        } catch (err) {
            console.log(err);
        }
    }, []);

    useEffect(() => {
        fetchCommErrors();
        const interval = setInterval(fetchCommErrors, 60000);
        return () => clearInterval(interval);
    }, [fetchCommErrors]);
    // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
    // Generating new states depending upon the machines list
    const [states, setStates] = useState([]);

    useEffect(() => {
        setStates(listOfMachines.map(machine => machine.initialState));
    }, [listOfMachines]);

    const handleUpdateState = (index, newState) => {
        setStates(prevStates => {
            const newStates = [...prevStates];
            newStates[index] = newState;
            return newStates;
        });
    };
    // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
    // Fetching list of machines from the db
    const fetchWegid = useCallback(async () => {
        await fetch(`${API}/fetchWegid`)
            .then(res => {
                res.json()
                    .then(result => {
                        const data = result.listOfWegid.wegid;
                        const feedNum = result.listOfFeederNumber.feeder_number;
                        if (data !== [] && feedNum !== []) {
                            setListOfMachines(data);
                            setListOfFeederNumber(feedNum);
                        } else {
                            setListOfMachines(listOfMachines);
                            setListOfFeederNumber(listOfFeederNumber);
                        }
                    })
            })
    }, [listOfMachines, listOfFeederNumber]);

    useEffect(() => {
        if (listOfMachines.length === 0) {
            fetchWegid();
        } else {
            listOfMachines.map((machine, i) => {
                return handleUpdateState(i, machine);
            });
        }
    }, [listOfMachines, fetchWegid]);
    // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
    // Getting data from Socket.io stream and 
    socket.on("recieve-temp", (liveDatum) => {
        const key = liveDatum.data.wegid;
        setStates(prevValues => ({
            ...prevValues,
            [key]: liveDatum
        }));
        
    });
    // ---------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------
    // showCard function
    const showCards = useCallback(() => {
        // ---------------------------------------------------------------------------
        // Bypass feature
        const handleBypassToggle = (machineName, isBypassed) => {
            const updatedMachines = bypassedMachines.slice();
            if (isBypassed) {
                updatedMachines.push(machineName);
            } else {
                const index = updatedMachines.indexOf(machineName);
                updatedMachines.splice(index, 1);
            }
            setBypassedMachines(updatedMachines);
        };
        // ---------------------------------------------------------------------------
        return (
            <div className='dashboard--machine-cards'>
                {listOfMachines.length !== 0 && listOfMachines.map((machineName, i) => {
                        
                    if (states[machineName] !== undefined) {
                        var dataToShow = states[machineName].data;
                    }
                    const feed_num = listOfFeederNumber[i]
                    const isBypassed = bypassedMachines.includes(machineName);
                    const generatedToday = generationSummary.machines
                        ? generationSummary.machines[machineName]
                        : undefined;
                    const generatedMonth = generationSummary.machinesMonth
                        ? generationSummary.machinesMonth[machineName]
                        : undefined;
                    return (
                        <Cards
                            key={machineName}
                            data={{ machineName, dataToShow, feed_num, generatedToday, generatedMonth }}
                            isBypassed={isBypassed}
                            onBypassToggle={handleBypassToggle}
                            
                        />
                    )
                })}
            </div>
        );
    }, [listOfFeederNumber, listOfMachines, states, bypassedMachines, generationSummary]);
    // ---------------------------------------------------------------------------

    const bypassedCount = bypassedMachines.length; 
    
    return (
        <Layout>
            <div className='dashboard--container'>
                <div className="dashboard--machines-info-boxes">
                    <div className="dashboard--machiches-info-box">
                        <p>Total Machines</p>
                        <p>{listOfMachines.length}</p>
                    </div>
                    <div className="dashboard--machiches-info-box">
                        <p>Normal Machines</p>
                        <p>{Math.max(0, listOfMachines.length - commErrors.count)}</p>
                    </div>
                    <div
                        className="dashboard--machiches-info-box dashboard--comm-error-box"
                        onClick={() => setShowCommErrorModal(true)}
                    >
                        <p>Error Machines</p>
                        <p className='data-style'>{commErrors.count}</p>
                    </div>
                    <div className="dashboard--machiches-info-box">
                        <p>Bypassed Machines</p>
                        <p className='data-style'>{bypassedCount}</p>
                    </div>
                </div>

                <Modal
                    isOpen={showCommErrorModal}
                    onRequestClose={() => setShowCommErrorModal(false)}
                    style={{ content: { top: '54%', left: '50%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '900px', maxHeight: '80vh', overflowY: 'auto' } }}
                    ariaHideApp={false}
                >
                    <div className="dashboard--comm-error-modal">
                        <div className="dashboard--comm-error-modal-header">
                            <h2>Error Machines ({commErrors.count})</h2>
                            <button onClick={() => setShowCommErrorModal(false)}>Close</button>
                        </div>
                        {commErrors.machines.length === 0 ? (
                            <p>No machines currently have a communication error.</p>
                        ) : (
                            <table className="dashboard--comm-error-table">
                                <thead>
                                    <tr>
                                        <th>Machine</th>
                                        <th>Last Communication Time</th>
                                        <th>Last Voltage (kV)</th>
                                        <th>Last Current (A)</th>
                                        <th>Last Power (kW)</th>
                                        <th>Last Temperature (°C)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commErrors.machines.map((m) => (
                                        <tr key={m.wegid}>
                                            <td>{m.wegid}</td>
                                            <td>{m.lastValidReading ? new Date(m.lastValidReading.log_time).toLocaleString() : 'Never communicated'}</td>
                                            <td>{m.lastValidReading ? `${m.lastValidReading.v12} / ${m.lastValidReading.v23} / ${m.lastValidReading.v31}` : '-'}</td>
                                            <td>{m.lastValidReading ? `${m.lastValidReading.current_1} / ${m.lastValidReading.current_2} / ${m.lastValidReading.current_3}` : '-'}</td>
                                            <td>{m.lastValidReading ? m.lastValidReading.power_1 : '-'}</td>
                                            <td>{m.lastValidReading ? `${m.lastValidReading.temperature_1} / ${m.lastValidReading.temperature_2}` : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Modal>

                <div className="dashboard--generation-boxes">
                    <div className="dashboard--generation-box">
                        <p>Generated Today</p>
                        <p>{generationSummary.day ?? '-'} kWh</p>
                    </div>
                    <div className="dashboard--generation-box">
                        <p>Generated This Month</p>
                        <p>{generationSummary.month ?? '-'} kWh</p>
                    </div>
                    <div className="dashboard--generation-box">
                        <p>Generated This Year</p>
                        <p>{generationSummary.year ?? '-'} kWh</p>
                    </div>
                </div>

                {showCards()}
                
            </div>
        </Layout>
    );
};

export default Dashboard