import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { BsArrowsFullscreen } from "react-icons/bs";
import { GiWaterDrop } from "react-icons/gi";
import { IoMdThermometer } from "react-icons/io";

import FullScreenCard from './FullScreenCard';
import "./cards.css";


const Cards = (props) => {  
    const { isBypassed, onBypassToggle } = props

    const [isCardOpen, setIsCardOpen] = useState(false);
    const [machineStatus, setMachineStatus] = useState('Normal')
    const [cardColor, setCardColor] = useState({
        red: false,
        green: true,
        yellow: false
    })
    
    const { red, green, yellow } = cardColor

    // bypass
    const handleBypassToggle = () => {
        const newValue = !isBypassed;
        onBypassToggle(machineName, newValue);
    };

    // Modal card style
    const customStyles = {
        content: {
            top: '54%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: "0",
            
            width: '95%',
            height: '89%'
        }
    };

    const { machineName, dataToShow, generatedToday } = props.data;

    if (dataToShow !== undefined) {
        var {
            temperature_1,
            temperature_2,
    
            v12,
            v23,
            v31,
    
            power_1,
    
            current_1,
            current_2,
            current_3,
    
            frequency,

            tot_act_energy,
            ap_max_demand,
            app_max_demand,

            thd_vr,
            thd_vy,
            thd_vb,
            thd_cl1,
            thd_cl2,
            thd_cl3,

            brk_on,
            brk_off,
            buc_alm,
            spr_cha,
            mog_trp,
            wti_alm,
            oti_alm,
            prv_trp,
            last_data_sent_at
        } = dataToShow;   
    };

    // func for alarm indicator
    const handleAlarmIndicator = (alarm) => {
        if (alarm === 1) {
            return "cards--alarm-indicator-red";
        } else {
            return "cards--alarm-indicator-green";
        }
    }

    let color100
    let color200
    let color300
    let color400
    let boxShadow

    if (red) {
        color100 = '#FFEFEF'
        color200 = '#E9F7DE'
        color300 = '#D74F4F'
        color400 = '#C30000'
        boxShadow = 'rgba(173, 0, 0, 0.3)'
    } else if (green) {
        color100 = '#E9F7DE'
        color200 = '#AED09A'
        color300 = '#66B538'
        color400 = '#1C4C00'
        boxShadow = 'rgba(52, 142, 0, 0.35)'
    } else if (yellow) {
        color100 = '#FFFBF0'
        color200 = '#FFFBF0'
        color300 = '#E98300'
        color400 = '#E98300'
        boxShadow = 'rgba(173, 0, 0, 0.3)'
    }

    const cardStyle = {
        '--color-100': color100,
        '--color-200': color200,
        '--color-300': color300,
        '--color-400': color400,
        "--box-shadow-color": boxShadow
    }

    useEffect(() => {
        if (isBypassed) {
            setCardColor({ red: false, green: false, yellow: true })
            setMachineStatus('Bypassed')
        } else {
            setCardColor({ red: false, green: true, yellow: false })
            setMachineStatus('Normal')
        }
    }, [isBypassed])

    return (
        <div className='cards--wrapper' style={cardStyle}>
            <button className='cards--full-screen'
                onClick={
                    () => {
                        setIsCardOpen(true)
                    }}>
                <BsArrowsFullscreen />
            </button>
            <Modal
                isOpen={isCardOpen}
                onRequestClose={() => setIsCardOpen(false)}
                style={customStyles}
                ariaHideApp={false}
            >              
                <FullScreenCard
                    onClose={() => setIsCardOpen(false)}
                    dataToShow={dataToShow}
                    machineStatus={machineStatus}
                    machineName={machineName}
                    isBypassed={isBypassed}
                    onBypassToggle={handleBypassToggle}
                    cardStyle={cardStyle}
                />
            </Modal>
            <div className="cards--header">
                {machineName}
                <span className='cards--last-data-received'><br />Last Data at: {last_data_sent_at}</span>
            </div>
            
            <div className='cards--temperatures'>
                <div>
                    <GiWaterDrop />
                    <IoMdThermometer />
                    Oil - <span className='cards--data-color'>
                        {temperature_1}°C
                    </span>
                </div>
                <p className='cards--temp-separator'>|</p>
                <div>
                    <GiWaterDrop />
                    <IoMdThermometer />
                    Winding - <span className='cards--data-color'>
                        {temperature_2}°C
                    </span>
                </div>
            </div>
            
            <div className='cards--vol-cur-table-container'>
                <table className='cards--vol-cur-table'>
                    <tbody>
                        <tr>
                            <td>Line</td>
                            <td className='cards--data-color'>R</td>
                            <td className='cards--data-color'>Y</td>
                            <td className='cards--data-color'>B</td>
                        </tr>
                        <tr>
                            <td>Voltage(kV)</td>
                            <td className='cards--data-color'>{v12}</td>
                            <td className='cards--data-color'>{v23}</td>
                            <td className='cards--data-color'>{v31}</td>
                        </tr>
                        <tr>
                            <td>Current(A)</td>
                            <td className='cards--data-color'>{current_1}</td>
                            <td className='cards--data-color'>{current_2}</td>
                            <td className='cards--data-color'>{current_3}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div className='cards--pow-freq-feed'>
                <div>
                    <p>Power(kW)</p>
                    <p className='cards--data-color'>{power_1}</p>
                </div>
                <div>
                    <p>Frequency(Hz)</p>
                    <p className='cards--data-color'>{frequency}</p>
                </div>
                <div>
                    <p>Generated Today</p>
                    <p className='cards--data-color'>{generatedToday ?? '-'}</p>
                </div>
            </div>
            
            <div className='cards--pow-freq-feed cards--energy-row'>
                <div>
                    <p>Energy(kWh)</p>
                    <p className='cards--data-color'>{tot_act_energy ?? '-'}</p>
                </div>
                <div>
                    <p>Max Demand(kW)</p>
                    <p className='cards--data-color'>{ap_max_demand ?? '-'}</p>
                </div>
                <div>
                    <p>Max Demand(kVA)</p>
                    <p className='cards--data-color'>{app_max_demand ?? '-'}</p>
                </div>
            </div>

            <div className='cards--thd-container'>
                <p className='cards--thd-title'>Harmonics (THD %)</p>
                <div className='cards--thd-values'>
                    <div>
                        <p>VR</p>
                        <p className='cards--data-color'>{thd_vr ?? '-'}</p>
                    </div>
                    <div>
                        <p>VY</p>
                        <p className='cards--data-color'>{thd_vy ?? '-'}</p>
                    </div>
                    <div>
                        <p>VB</p>
                        <p className='cards--data-color'>{thd_vb ?? '-'}</p>
                    </div>
                    <div>
                        <p>CL1</p>
                        <p className='cards--data-color'>{thd_cl1 ?? '-'}</p>
                    </div>
                    <div>
                        <p>CL2</p>
                        <p className='cards--data-color'>{thd_cl2 ?? '-'}</p>
                    </div>
                    <div>
                        <p>CL3</p>
                        <p className='cards--data-color'>{thd_cl3 ?? '-'}</p>
                    </div>
                </div>
            </div>

            <div className='cards--alarm-header'>ALARM</div>

            <div className='cards--alarm-container'>
                <div className='cards--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(brk_on)}></p>
                    <p>BRK ON</p>
                </div>
                <div className='cards--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(brk_off)}></p>
                    <p>BRK OFF</p>
                </div>
                <div className='cards--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(buc_alm)}></p>
                    <p>BUCH TRIP</p>
                </div>
                <div className='cards--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(spr_cha)}></p>
                    <p>SP CRGD</p>
                </div>
                <div className='cards--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(wti_alm)}></p>
                    <p>WTI ALM</p>
                </div>
                <div className='cards--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(oti_alm)}></p>
                    <p>OTI</p>
                </div>
                <div className='cards--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(mog_trp)}></p>
                    <p>MOG. ALM</p>
                </div>
                <div className='cards--indicator-alarm-set'>
                    <p className={handleAlarmIndicator(prv_trp)}></p>
                    <p>PRV. TRIP</p>
                </div>
            </div>
        </div>
    );
};

export default Cards