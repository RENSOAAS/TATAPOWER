import React, { useEffect, useState } from 'react'
import Moment from 'moment-timezone';
import Layout from '../layout/Layout'
import { API } from '../config'

import DropdownNew from '../components/ui/Dropdown'
import GraphFilters from '../components/ui/GraphFilters'
import TabNavItem from '../components/ui/tabComponents/TabNavItem'
import TabContent from '../components/ui/tabComponents/TabContent'
import ChartsForGraphs from '../components/ui/chartsForGraphs'
import BarGraph from '../components/ui/BarGraph';
import { FiFilter } from "react-icons/fi"
import "../styles/graphs.css"

const Graphs = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    const defaultDate = `${year}-${month}-${day}`;
    
    const date = new Date();
    const showTime = date.getHours()
        + ':' + date.getMinutes()
        + ":" + date.getSeconds();

    const [listOfMachines, setListOfMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState({});
    const [filterCardIsOpen, setFilterCardIsOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({
        periodFrom: defaultDate + ' 00:01:00',
        periodTo: defaultDate + ' ' + showTime,
    });
    const [activeTabButtons, setActiveTabButtons] = useState("tab1");
    const [dataForGraph, setDataForGraph] = useState([])
    const [activeGraphData, setActiveGraphData] = useState({
        voltage_1: [],
        voltage_2: [],
        voltage_3: [],
        current_1: [],
        current_2: [],
        current_3: [],
        temperature_1: [],
        temperature_2: [],
        log_time: []
    })
    const [barGraphData, setBarGraphData] = useState({})

    const { periodFrom, periodTo } = filterValues

    // ---------------------------------------------------------------------------
    // Fetching list of machines from the db
    useEffect(() => {
        let isMounted = true;
        const fetchWegid = async () => {
            try {
                const res = await fetch(`${API}/fetchWegid`);
                const result = await res.json();
                const data = result.listOfWegid.wegid;
                
                const machinesWithFormat = data.map((machine, i) => {
                    const formattedMachine = machine.replace(/(\D)(\d)/g, "$1 $2");
                    return { name: machine, value: formattedMachine, id: i + 1 };
                });
                if (isMounted) {
                    setListOfMachines(machinesWithFormat);
                    setSelectedMachine(machinesWithFormat[0]);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchWegid();
        return () => {
            isMounted = false;
        };
    }, []);

    // ---------------------------------------------------------------------------
    // Fetching the data for graph
    useEffect(() => {
        const fetchDataForGraph = async (name, periodFrom, periodTo) => {
            try {
                const bodyData = {
                    selectedMachine: name,
                    periodFrom: periodFrom,
                    periodTo: periodTo
                }
                const res = await fetch(`${API}/fetchDataForGraphs`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(bodyData)
                });
                const resData = await res.json();
                setDataForGraph(resData.data)
            } catch (err) {
                console.log(err);
            }
        }

        if (selectedMachine && Object.keys(selectedMachine).length !== 0) {
            const name = selectedMachine.name.toLowerCase()
            fetchDataForGraph(name, periodFrom, periodTo)
        }
    }, [selectedMachine, periodFrom, periodTo]);
    
    const changeTimeStamp = (logTime) => {
        const date = Moment.utc(logTime);
        const formattedDate = date.tz("Asia/Kolkata").format("DD-MMM-YY, h:mm a");
        return formattedDate;
    };

    useEffect(() => {
        setActiveGraphData(prevGraphData => {
            const updatedGraphData = { ...prevGraphData };

            if (activeTabButtons === 'tab1') {
                updatedGraphData.voltage_1 = dataForGraph.map(data => Number(data.v12));
                updatedGraphData.voltage_2 = dataForGraph.map(data => Number(data.v23));
                updatedGraphData.voltage_3 = dataForGraph.map(data => Number(data.v31));
                updatedGraphData.log_time = dataForGraph.map(data => changeTimeStamp(data.log_time));
            } else if (activeTabButtons === 'tab2') {
                updatedGraphData.current_1 = dataForGraph.map(data => Number(data.current_1));
                updatedGraphData.current_2 = dataForGraph.map(data => Number(data.current_2));
                updatedGraphData.current_3 = dataForGraph.map(data => Number(data.current_3));
                updatedGraphData.log_time = dataForGraph.map(data => changeTimeStamp(data.log_time));
            } else if (activeTabButtons === 'tab3') {
                updatedGraphData.temperature_1 = dataForGraph.map(data => Number(data.temperature_1));
                updatedGraphData.temperature_2 = dataForGraph.map(data => Number(data.temperature_2));
                updatedGraphData.log_time = dataForGraph.map(data => changeTimeStamp(data.log_time));
            }

            return updatedGraphData;
        });
    }, [activeTabButtons, dataForGraph, selectedMachine, periodFrom, periodTo]);

    // Bar graph data
    useEffect(() => {
        const fetchBarGraphData = async (name, periodFrom, periodTo) => {
            try {
                const bodyData = {
                    selectedMachine: name,
                    periodFrom: periodFrom,
                    periodTo: periodTo
                }
                const res = await fetch(`${API}/fetchBarGraphData`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(bodyData)
                });
                const resData = await res.json();
                const Data = await resData.data
                setBarGraphData(Data)
            } catch (err) {
                console.log(err);
            }
        }

        if (selectedMachine && Object.keys(selectedMachine).length !== 0) {
            const name = selectedMachine.name.toLowerCase()
            fetchBarGraphData(name, periodFrom, periodTo)
        }
    }, [selectedMachine, periodFrom, periodTo]);

    return (
        <Layout>
            <div className='graphs--wrapper'>
                <div className="graphs--container">
                    <div className="graphs--heading">
                        <p className="graphs--header">Graphs</p>
                        <div className="graphs--filters">
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
                                        <GraphFilters
                                            setFilterValues={setFilterValues}
                                            filterCardIsOpen={filterCardIsOpen}
                                            setFilterCardIsOpen={setFilterCardIsOpen}
                                        />
                                    </div>
                                }
                            </div>
                            {selectedMachine && (
                                <DropdownNew
                                    selectedMachine={{
                                        name: selectedMachine.name,
                                        value: selectedMachine.value,
                                        id: selectedMachine.id
                                    }}
                                    setSelectedMachine={setSelectedMachine}
                                    items={listOfMachines}
                                />
                            )}
                        </div>
                    </div>
                    <div className="graphs--graph-area">
                        {/* tab switches */}
                        <div className="graphs--tab-navs">
                            <ul>
                                <TabNavItem
                                    title="Voltage"
                                    id="tab1"
                                    activeTab={activeTabButtons}
                                    setActiveTab={setActiveTabButtons}
                                />
                                <TabNavItem
                                    title="Current"
                                    id="tab2"
                                    activeTab={activeTabButtons}
                                    setActiveTab={setActiveTabButtons}
                                />
                                <TabNavItem
                                    title="Temperature"
                                    id="tab3"
                                    activeTab={activeTabButtons}
                                    setActiveTab={setActiveTabButtons}
                                />
                                <TabNavItem
                                    title="Power"
                                    id="tab4"
                                    activeTab={activeTabButtons}
                                    setActiveTab={setActiveTabButtons}
                                />
                            </ul>
                        </div>
                        <div className="graphs--chart-area">
                            <TabContent id="tab1" activeTab={activeTabButtons}>
                                {activeGraphData.voltage_1 && activeGraphData.voltage_2 && activeGraphData.voltage_3 &&
                                    <ChartsForGraphs
                                        width="100%"
                                        height="61dvh"
                                        labelForChart={activeGraphData.log_time}
                                        dataSets={[
                                            {
                                                label: "Voltage 1",
                                                graphData: activeGraphData.voltage_1,
                                                lineColor: "#FF0000",
                                            },
                                            {
                                                label: "Voltage 2",
                                                graphData: activeGraphData.voltage_2,
                                                lineColor: "#FFFF00",
                                            },
                                            {
                                                label: "Voltage 3",
                                                graphData: activeGraphData.voltage_3,
                                                lineColor: "#0000FF",
                                            }
                                        ]}
                                    />
                                }
                            </TabContent>
                            <TabContent id="tab2" activeTab={activeTabButtons}>
                                {activeGraphData.current_1 && activeGraphData.current_2 && activeGraphData.current_3 &&
                                    <ChartsForGraphs
                                        width="100%"
                                        height="61dvh"
                                        labelForChart={activeGraphData.log_time}
                                        dataSets={[
                                            {
                                                label: "Current 1",
                                                graphData: activeGraphData.current_1,
                                                lineColor: "#FF0000",
                                            },
                                            {
                                                label: "Current 2",
                                                graphData: activeGraphData.current_2,
                                                lineColor: "#FFFF00",
                                            },
                                            {
                                                label: "Current 3",
                                                graphData: activeGraphData.current_3,
                                                lineColor: "#0000FF",
                                            },
                                        ]}
                                    />
                                }
                            </TabContent>
                            <TabContent id="tab3" activeTab={activeTabButtons}>
                                {activeGraphData.temperature_1 && activeGraphData.temperature_2 &&
                                    <ChartsForGraphs
                                        width="100%"
                                        height="61dvh"
                                        labelForChart={activeGraphData.log_time}
                                        dataSets={[
                                            {
                                                label: "Temperature 1",
                                                graphData: activeGraphData.temperature_1,
                                                lineColor: "#FF0000",
                                            },
                                            {
                                                label: "Temperature 2",
                                                graphData: activeGraphData.temperature_2,
                                                lineColor: "#FFFF00",
                                            }
                                        ]}
                                    />
                                }
                            </TabContent>
                            <TabContent id="tab4" activeTab={activeTabButtons}>
                                {barGraphData &&
                                    <BarGraph
                                        width="100%"
                                        height="61dvh"
                                        labelForChart={
                                            barGraphData.log_time && barGraphData.log_time.map(items => {
                                                return changeTimeStamp(items)
                                            })
                                        }
                                        dataSets={[
                                            {
                                                label: "EXPACTENERGY",
                                                graphData: barGraphData.EXPACTENERGY,
                                                lineColor: "gold",
                                            },
                                            {
                                                label: "EXPREAENERGY",
                                                graphData: barGraphData.EXPREAENERGY,
                                                lineColor: "yellow",
                                            },
                                            {
                                                label: "IMPACTENERGY",
                                                graphData: barGraphData.IMPACTENERGY,
                                                lineColor: "blue",
                                            },
                                            {
                                                label: "IMPREAENERGY",
                                                graphData: barGraphData.IMPREAENERGY,
                                                lineColor: "orangered",
                                            },
                                            {
                                                label: "TOTACTENERGY",
                                                graphData: barGraphData.TOTACTENERGY,
                                                lineColor: "orange",
                                            },
                                            {
                                                label: "TOTAPPENERGY",
                                                graphData: barGraphData.TOTAPPENERGY,
                                                lineColor: "pink",
                                            },
                                            {
                                                label: "TOTREAENERGY",
                                                graphData: barGraphData.TOTREAENERGY,
                                                lineColor: "skyblue",
                                            }
                                        ]}
                                    />
                                }
                            </TabContent>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Graphs