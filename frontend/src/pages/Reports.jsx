import React, { useState, useEffect, useCallback  } from 'react'
import Layout from '../layout/Layout';
import { API } from "../config";
import "../styles/reports.css";
import "../styles/loader.css"

import ShowUnfilteredTable from '../components/ui/ShowUnfilteredTable';
import ShowFilteredTable from '../components/ui/ShowFilteredTable';
import FilterCard from '../components/ui/FilterButton';

import { FiFilter } from "react-icons/fi";
import { AiOutlineMail } from "react-icons/ai";
import { BsDownload } from "react-icons/bs";

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [filterCardIsOpen, setFilterCardIsOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({ periodFrom: '', periodTo: '', machineNames: {} });
    
    const [unfilteredData, setUnfilteredData] = useState([{}]);
    const [filteredData, setFilteredData] = useState([{}]);
    const [popup, setPopup] = useState({
        error: '',
        success: false,
        message: ''
    })
    
    const { periodFrom, periodTo, machineNames } = filterValues;
    const selectedMachinesList = Object.keys(machineNames).filter(key => machineNames[key] === true);

    // ----------------------------------------------------------------------------------------------------
    const getUnfilteredReportDataFromDb = useCallback(async () => {
        const fetchRequestBody = {
            selectedMachines: "all"
        };
        await fetch(`${API}/getUnfilteredData`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fetchRequestBody)
        })
            .then(res => {
                res.json().then(res => {
                    const data = res.data;
                    if (data !== []) {
                        setUnfilteredData([data][0]);
                        setLoading(false);
                    } else {
                        setUnfilteredData(unfilteredData);
                    }
                })
            });
    }, [unfilteredData]);

    const getFilteredReportDataFromDb = useCallback(async () => {
        const timeFrom = "00:01:00";
        const timeTo = "23:59:00";
    
        const filteredDateFrom = periodFrom + ' ' + timeFrom;
        const filteredDateTo = periodTo + ' ' + timeTo;
    
        const fetchRequestBody = {
            filteredDateFrom: filteredDateFrom,
            filteredDateTo: filteredDateTo,
            selectedMachines: selectedMachinesList
        };
        await fetch(`${API}/getFilteredData`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fetchRequestBody)
        })
            .then(res => {
                res.json().then(res => {
                    const data = res.data;
                    if (data !== []) {
                        setFilteredData([data][0]);
                        setLoading(false);
                    } else {
                        setFilteredData(filteredData);
                    }
                })
            });
    }, [periodFrom, periodTo, selectedMachinesList, filteredData]);

    useEffect(() => {
        let selectedMachinesList = Object.keys(machineNames).filter(key => machineNames[key] === true);
        if (periodFrom !== '' && periodTo !== '' && selectedMachinesList.length !== 0) {
            setLoading(true)
            getFilteredReportDataFromDb();
        } else {
            setLoading(true)
            getUnfilteredReportDataFromDb();
        }
    }, [periodFrom, periodTo, machineNames]);
    // ----------------------------------------------------------------------------------------------------

    // Pop ups---------------------------------------------------------------------------------------------
    const showError = () => (
        <div
            className='alert alert-danger'
            style={{ display: popup.error ? '' : 'none' }}
        >
            {popup.error}
        </div>
    );

    const showSuccess = () => (
        <div
            className='alert alert-info'
            style={{ display: popup.success ? '' : 'none' }}
        >
            {popup.message}
        </div>
    );

    useEffect(() => {
        if (popup.error) {
            setTimeout(() => {
                setPopup({
                    ...popup,
                    error: false,
                });
            }, 10 * 1000)
        }
        if (popup.success) {
            setTimeout(() => {
                setPopup({
                    ...popup,
                    success: false,
                });
            }, 10 * 1000)
        }
    }, [popup]);
    // ----------------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------------
    // Email button handler
    const handleEmailButton = async (e) => {
        e.preventDefault();

        const timeFrom = "00:01:00";
        const timeTo = "23:59:00";

        if (periodFrom !== '' && periodTo !== '' && selectedMachinesList.length !== 0) {
            const filteredDateFrom = periodFrom + ' ' + timeFrom;
            const filteredDateTo = periodTo + ' ' + timeTo;
        
            const fetchRequestBody = {
                filteredDateFrom: filteredDateFrom,
                filteredDateTo: filteredDateTo,
                selectedMachines: selectedMachinesList
            };

            await fetch(`${API}/emailReport`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fetchRequestBody)
            }).then(async (res) => {
                const data = await res.json()
                if (data.status) {
                    setPopup({
                        ...popup,
                        success: true,
                        message: data.message
                    })
                } else {
                    setPopup({ ...popup, success: false, error: data.message });
                }
                if (res.status === 400) {
                    // alert("The report you are trying to email is greater than 25MB");
                    setPopup({ ...popup, success: false, error: data.message });
                }
            });
        } else {
            alert("Select machines and dates from filter")
        }
    };
    // ----------------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------------
    // Download button handler
    var filename = '';
    const handleDownloadButton = async (e) => {
        e.preventDefault();
        const timeFrom = "00:01:00";
        const timeTo = "23:59:00";

        if (periodFrom !== '' && periodTo !== '' && selectedMachinesList.length !== 0) {
            const filteredDateFrom = periodFrom + ' ' + timeFrom;
            const filteredDateTo = periodTo + ' ' + timeTo;
        
            const fetchRequestBody = {
                filteredDateFrom: filteredDateFrom,
                filteredDateTo: filteredDateTo,
                selectedMachines: selectedMachinesList
            };

            const res = await fetch(`${API}/generateFileAndGetFilename`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fetchRequestBody)
            })
            const result = await res.json();
            filename = result.filename;

            fetch(`${API}/downloadReport?filename=${filename}`, {
                method: "GET"
            })
                .then(async (res) => {
                    res.blob().then(blob => {
                        let url = window.URL.createObjectURL(blob);
                        let a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        a.click();
                    })
                });
        } else {
            alert("Select machines and dates from filter")
        }
    };
    // ----------------------------------------------------------------------------------------------------

    return (
        <Layout>
            <div className='reports--container'>
                <div className="reports--header">
                    <p className='reports--header-title'>Reports</p>
                    {showError()}
                    {showSuccess()}
                    {/* Filter button */}
                    <div className="dropdown">
                        <button
                            className="dropbtn"
                            onClick={() => setFilterCardIsOpen(!filterCardIsOpen)}
                        >
                            <p>Filters</p>
                            <FiFilter style={{ color: "#fff" }} />
                        </button>
                        {
                            filterCardIsOpen &&
                            <div className="dropdown-content">
                                <FilterCard
                                    filterValues={filterValues}
                                    setFilterValues={setFilterValues}
                                    filterCardIsOpen={filterCardIsOpen}
                                    setFilterCardIsOpen={setFilterCardIsOpen}
                                />
                            </div>
                        }
                    </div>

                    {/* Email button */}
                    <button
                        className='reports--header-button'
                        onClick={(e) => handleEmailButton(e)}
                    >
                        <p>Email</p>
                        <AiOutlineMail />
                    </button>

                    {/* Download button */}
                    <button
                        className='reports--header-button'
                        onClick={(e) => handleDownloadButton(e)}
                    >
                        <p>Download</p>
                        <BsDownload />
                    </button>
                </div>

                {/* table */}
                <div className='reports--table-container'>
                    {loading ?
                        (
                            <div className='loader--wrapper'>
                                <div className="loader"></div>
                            </div>    
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>ID</th>
                                        <th>WEGID</th>
                                        <th>Oil Temperature</th>
                                        <th>Winding Temperature</th>
                                        <th>V1</th>
                                        <th>V2</th>
                                        <th>V3</th>
                                        <th>V12</th>
                                        <th>V23</th>
                                        <th>V31</th>
                                        <th>C1</th>
                                        <th>C2</th>
                                        <th>C3</th>
                                        <th>Power</th>
                                        <th>Frequency</th>
                                        <th>BRK ON</th>
                                        <th>BRK OFF</th>
                                        <th>BUC ALM</th>
                                        <th>SPR CHA</th>
                                        <th>MOG TRP</th>
                                        <th>WTI ALM</th>
                                        <th>OTI ALM</th>
                                        <th>PRV TRP</th>
                                        <th>THD VR</th>
                                        <th>THD VY</th>
                                        <th>THD VB</th>
                                        <th>THD CL1</th>
                                        <th>THD CL2</th>
                                        <th>THD CL3</th>
                                        <th>ERR CODE</th>
                                        <th width="10rem">TimeStamp</th>
                                    </tr>
                                </thead>
                                {!periodFrom && !periodTo && machineNames
                                    ? <ShowUnfilteredTable data={unfilteredData} />
                                    : <ShowFilteredTable data={filteredData} />
                                }
                            </table>
                        )}
                    
                </div>
            </div>

        </Layout>
    );
};

export default Reports;