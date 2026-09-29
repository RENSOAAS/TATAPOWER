import React, { useEffect, useState, useCallback } from 'react';
import {API} from "../../config";
import "./fullScreenCard.css";

import { AiOutlineClose } from "react-icons/ai";

// tab switch
import TabNavItem from './tabComponents/TabNavItem';
import TabContent from './tabComponents/TabContent';
import Chart from './charts';

const FullScreenCard = ({ onClose, dataToShow, machineStatus, machineName, onBypassToggle, isBypassed, cardStyle }) => {
    const [activeTabButtons, setActiveTabButtons] = useState("tab1");
    const [activeTabTg, setActiveTabTg] = useState("tab4");
    const [data, setData] = useState({
        vol1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        vol2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        vol3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        vol12: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        vol23: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        vol31: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        cur1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        cur2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        cur3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        temp1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        temp2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    
    if (dataToShow !== undefined) {
        var {
            temperature_1,
            temperature_2,
    
            voltage_1,
            voltage_2,
            voltage_3,

            v12, 
            v23,
            v31,
    
            power_1,
    
            current_1,
            current_2,
            current_3,
    
            frequency,

            thd_cl1,
            thd_cl2,
            thd_cl3,
            thd_vb,
            thd_vr,
            thd_vy,
    
            brk_on,
            brk_off,
            buc_alm,
            spr_cha,
            mog_trp,
            wti_alm,
            oti_alm,
            prv_trp,

            ap_max_demand,
            ap_min_demand,
            rp_max_demand,
            rp_min_demand,
            app_max_demand,
            imp_act_energy,
            exp_act_energy,
            tot_act_energy,
            imp_rea_energy,
            exp_rea_energy,
            tot_rea_energy,
            tot_app_energy,

            macid,
            err_code,
            last_data_sent_at
        } = dataToShow;   
    };

    const showValue = (value, unit = '') => (
        value === undefined || value === null ? '--' : `${Number(value).toLocaleString('en-IN')}${unit}`
    );

    const [lastDataAt, setLastDataAt] = useState(["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]);

    useEffect(() => {
        if (lastDataAt.length >= 12) {
            lastDataAt.pop();
        }
        if (last_data_sent_at !== undefined) {
            const time = last_data_sent_at.slice(11)
            lastDataAt.unshift(time)
        }
        setLastDataAt(lastDataAt)
    }, [lastDataAt, last_data_sent_at]);

    const [machineData, setMachineData] = useState({});

    const fetchMachineData = async () => {
        try {
            const res = await fetch(`${API}/fetchMachineData`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ wegid: machineName })
            });
            const resData = await res.json();
            setMachineData(resData.data)

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchMachineData();
    }, []);

    // ---------------------------------------------------------------------------
    // Energy generated today / this month / this year, for this machine
    const [generationSummary, setGenerationSummary] = useState({ day: null, month: null, year: null });

    const fetchGenerationSummary = useCallback(async () => {
        try {
            const res = await fetch(`${API}/fetchGenerationSummary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wegid: machineName })
            });
            const result = await res.json();
            if (result.status) {
                setGenerationSummary(result.data);
            }
        } catch (err) {
            console.log(err);
        }
    }, [machineName]);

    useEffect(() => {
        fetchGenerationSummary();
        const interval = setInterval(fetchGenerationSummary, 60000);
        return () => clearInterval(interval);
    }, [fetchGenerationSummary]);
    // ---------------------------------------------------------------------------

    const {
        state,
        district,
        feeder_number
    } = machineData;

    // func for alarm indicator
    const handleAlarmIndicator = (alarm) => {
        if (alarm === 1) {
            return "fullscreen-cards--alarm-indicator-red";
        } else {
            return "fullscreen-cards--alarm-indicator-green";
        }
    }

    const functionToSetDataState = useCallback((dataStateArray, dataStateValue) => {
        if (dataStateArray.length >= 12) {
            dataStateArray.pop();
        }
        dataStateArray.unshift(dataStateValue);
    }, []);

    useEffect(() => {
        if (activeTabTg === 'tab4') {
            functionToSetDataState(data.vol1, voltage_1);
        } else if (activeTabTg === 'tab5') {
            functionToSetDataState(data.vol2, voltage_2);
        } else if (activeTabTg === 'tab6') {
            functionToSetDataState(data.vol3, voltage_3);
        } else if (activeTabTg === 'tab7') {
            functionToSetDataState(data.vol12, v12);
        } else if (activeTabTg === 'tab8') {
            functionToSetDataState(data.vol23, v23);
        } else if (activeTabTg === 'tab9') {
            functionToSetDataState(data.vol31, v31);
        } else if (activeTabTg === 'tab10') {
            functionToSetDataState(data.cur1, current_1);
        } else if (activeTabTg === 'tab11') {
            functionToSetDataState(data.cur2, current_2);
        } else if (activeTabTg === 'tab12') {
            functionToSetDataState(data.cur3, current_3);
        } else if (activeTabTg === 'tab13') {
            functionToSetDataState(data.temp2, temperature_2);
        } else if (activeTabTg === 'tab14') {
            functionToSetDataState(data.temp1, temperature_1);
        }
    }, [
        activeTabTg,
        data,
        functionToSetDataState,

        voltage_1,
        voltage_2,
        voltage_3,
        v12,
        v23,
        v31,
        current_1,
        current_2,
        current_3,
        temperature_1,
        temperature_2
    ]);

    return (
        <div className='fullscreen-card--container' style={cardStyle}>
            
            <p className='close-button-wrapper'>
                <button className='fullscreen-card--close-button' onClick={onClose}>
                    <AiOutlineClose size={20} />
                </button>
            </p>

            <div className='fullscreen-card--header'>
                <p>{machineName}</p>

                <p>Bypass</p>
                <label className="switch">
                    <input type="checkbox" checked={isBypassed} onChange={onBypassToggle} />
                    <span className="slider round"></span>
                </label>
            </div>

            <div className='fullscreen-card--machine-details'>
                <div className='fullscreen-card--machine-details-box'>
                    <p>Data Last Received At</p>
                    <p>{last_data_sent_at ? last_data_sent_at : 'Waiting For Next Data'}</p>
                </div>
                <div className='fullscreen-card--machine-details-box'>
                    <p>Feeder Number</p>
                    <p>{feeder_number}</p>
                </div>
                <div className='fullscreen-card--machine-details-box'>
                    <p>Location</p>
                    <p>{state + '/' + district}</p>
                </div>
                <div className='fullscreen-card--machine-details-box'>
                    <p>Machine Status</p>
                    <p>{machineStatus}</p>
                </div>
            </div>

            <div className="fullscreen-card--machine-alarms">
                <p className='alarm-title'>Alarms</p>
                <div className='brk-on fullscreen-card--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(brk_on)}></p>
                    <p>BRK ON</p>
                </div>
                <div className='brk-off fullscreen-card--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(brk_off)}></p>
                    <p>BRK OFF</p>
                </div>
                <div className='buc-alm fullscreen-card--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(buc_alm)}></p>
                    <p>BUCH TRIP</p>
                </div>
                <div className='spr-cha fullscreen-card--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(spr_cha)}></p>
                    <p>SP CRGD</p>
                </div>
                <div className='wti-alm fullscreen-card--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(wti_alm)}></p>
                    <p>WTI ALM</p>
                </div>
                <div className='oti-alm fullscreen-card--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(oti_alm)}></p>
                    <p>OTI ALM</p>
                </div>
                <div className='mog-trp fullscreen-card--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(mog_trp)}></p>
                    <p>MOG. ALM</p>
                </div>
                <div className='prv-trp fullscreen-card--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(prv_trp)}></p>
                    <p>PRV. TRIP</p>
                </div>
            </div>

            <div className='fullscreen-cards--thd-voltage-current'>
                <div className='fullscreen-cards-thd flex-box'>
                    <p className='flex-box--title'>Total Harmonic Distortion</p>
                    <div className='flex-box--values-wrapper'>
                        <div className="flex-box--values">
                            <p>THDVR</p>
                            <p>{thd_vr || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>THDVY</p>
                            <p>{thd_vy || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>THDVB</p>
                            <p>{thd_vb || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>THDCL1</p>
                            <p>{thd_cl1 || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>THDCL2</p>
                            <p>{thd_cl2 || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>THDCL3</p>
                            <p>{thd_cl3 || 0}</p>
                        </div>
                    </div>
                </div>
                <div className='fullscreen-cards-votage flex-box'>
                    <p className='flex-box--title'>Voltage(kV)</p>
                    <div className='flex-box--values-wrapper'>
                        <div className="flex-box--values">
                            <p>Voltage1</p>
                            <p>{voltage_1 || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Voltage2</p>
                            <p>{voltage_2 || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Voltage3</p>
                            <p>{voltage_3 || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Voltage12</p>
                            <p>{v12 || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Voltage23</p>
                            <p>{v23 || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Voltage31</p>
                            <p>{v31 || 0}</p>
                        </div>
                    </div>
                </div>
                <div className='fullscreen-cards-current flex-box'>
                    <p className='flex-box--title'>Current(Amp)</p>
                    <div className='flex-box--values-wrapper'>
                        <div className="flex-box--values">
                            <p>Current 1</p>
                            <p>{current_1 || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Current 2</p>
                            <p>{current_2 || 0}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Current 3</p>
                            <p>{current_3 || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fullscreen-cards--temp-freq-power">
                <div className="temp-freq-power--flexbox">
                    <p>Oil Temperature</p>
                    <p>{temperature_1 || 0}°C</p>
                </div>
                <div className="temp-freq-power--flexbox">
                    <p>Winding Temperature</p>
                    <p>{temperature_2 || 0}°C</p>
                </div>
                <div className="temp-freq-power--flexbox">
                    <p>Frequency</p>
                    <p>{frequency || 0} Hz</p>
                </div>
                <div className="temp-freq-power--flexbox">
                    <p>Power</p>
                    <p>{power_1 || 0} kW</p>
                </div>
            </div>

            <div className='fullscreen-cards--thd-voltage-current fullscreen-cards--demand-energy'>
                <div className='flex-box'>
                    <p className='flex-box--title'>Demand</p>
                    <div className='flex-box--values-wrapper'>
                        <div className="flex-box--values">
                            <p>Active Max (kW)</p>
                            <p>{showValue(ap_max_demand)}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Active Min (kW)</p>
                            <p>{showValue(ap_min_demand)}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Reactive Max (kVAR)</p>
                            <p>{showValue(rp_max_demand)}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Reactive Min (kVAR)</p>
                            <p>{showValue(rp_min_demand)}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Apparent Max (kVA)</p>
                            <p>{showValue(app_max_demand)}</p>
                        </div>
                    </div>
                </div>
                <div className='flex-box'>
                    <p className='flex-box--title'>Energy</p>
                    <div className='flex-box--values-wrapper'>
                        <div className="flex-box--values">
                            <p>Import Active (kWh)</p>
                            <p>{showValue(imp_act_energy)}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Export Active (kWh)</p>
                            <p>{showValue(exp_act_energy)}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Total Active (kWh)</p>
                            <p>{showValue(tot_act_energy)}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Import Reactive (kVARh)</p>
                            <p>{showValue(imp_rea_energy)}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Export Reactive (kVARh)</p>
                            <p>{showValue(exp_rea_energy)}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Total Reactive (kVARh)</p>
                            <p>{showValue(tot_rea_energy)}</p>
                        </div>
                        <div className="flex-box--values">
                            <p>Total Apparent (kVAh)</p>
                            <p>{showValue(tot_app_energy)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fullscreen-cards--temp-freq-power">
                <div className="temp-freq-power--flexbox">
                    <p>Generated Today</p>
                    <p>{showValue(generationSummary.day, ' kWh')}</p>
                </div>
                <div className="temp-freq-power--flexbox">
                    <p>Generated This Month</p>
                    <p>{showValue(generationSummary.month, ' kWh')}</p>
                </div>
                <div className="temp-freq-power--flexbox">
                    <p>Generated This Year</p>
                    <p>{showValue(generationSummary.year, ' kWh')}</p>
                </div>
            </div>

            <div className="fullscreen-cards--temp-freq-power">
                <div className="temp-freq-power--flexbox">
                    <p>Device MAC ID</p>
                    <p>{macid || '--'}</p>
                </div>
                <div className="temp-freq-power--flexbox">
                    <p>Error Code</p>
                    <p>{err_code === undefined || err_code === null ? '--' : (Number(err_code) === 0 ? 'None (0)' : err_code)}</p>
                </div>
            </div>

            <div className="fullscreen-cards--chart-with-tabs">
                <div className='chart-with-tabs--header'>
                    {/* tab switches */}
                    <div className="chart-with-tabs--button-group-one">
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
                        </ul>
                    </div>
                    {/* tab switches */}
                    <div className="chart-with-tabs--button-group-two">
                        <TabContent id="tab1" activeTab={activeTabButtons}>
                            <ul>
                                <TabNavItem
                                    title="V1"
                                    id="tab4"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                                <TabNavItem
                                    title="V2"
                                    id="tab5"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                                <TabNavItem
                                    title="V3"
                                    id="tab6"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                                <TabNavItem
                                    title="V12"
                                    id="tab7"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                                <TabNavItem
                                    title="V23"
                                    id="tab8"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                                <TabNavItem
                                    title="V31"
                                    id="tab9"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                            </ul>
                        </TabContent>
                        <TabContent id="tab2" activeTab={activeTabButtons}>
                            <ul>
                                <TabNavItem
                                    title="C1"
                                    id="tab10"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                                <TabNavItem
                                    title="C2"
                                    id="tab11"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                                <TabNavItem
                                    title="C3"
                                    id="tab12"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                            </ul>
                        </TabContent>
                        <TabContent id="tab3" activeTab={activeTabButtons}>
                            <ul>
                                <TabNavItem
                                    title="Winding"
                                    id="tab13"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                                <TabNavItem
                                    title="Oil"
                                    id="tab14"
                                    activeTab={activeTabTg}
                                    setActiveTab={setActiveTabTg}
                                />
                            </ul>
                        </TabContent>
                    </div>
                </div>
                <div className="chart-area">
                    <TabContent id="tab4" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.vol1}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                    <TabContent id="tab5" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.vol2}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                    <TabContent id="tab6" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.vol3}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                    <TabContent id="tab7" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.vol1}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                    <TabContent id="tab8" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.vol2}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                    <TabContent id="tab9" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.vol3}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                    <TabContent id="tab10" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.cur1}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                    <TabContent id="tab11" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.cur2}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                    <TabContent id="tab12" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.cur3}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                    <TabContent id="tab13" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.temp2}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                    <TabContent id="tab14" activeTab={activeTabTg}>
                        <Chart
                            width="100%"
                            height="25rem"
                            d={data.temp1}
                            detail=""
                            lineColor={cardStyle['--color-400']}
                            label=""
                            data_at={lastDataAt}
                        />
                    </TabContent>
                </div>
            </div>

            
        </div>
    );
}

export default FullScreenCard;
