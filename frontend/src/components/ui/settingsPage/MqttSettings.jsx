import React, { useEffect, useState } from 'react'
import { API } from '../../../config'
import "./mqttSettings.css"

const MqttSettings = () => {
    const [mqttConfigValues, setMqttConfigValues] = useState({
        PORT: '',
        HOST: '',
        USERNAME: '',
        PASSWORD: '',
        PROTOCOL: '',
    });
    const { PORT, HOST, USERNAME, PASSWORD, PROTOCOL } = mqttConfigValues

    const handleChange = name => event => {
        setMqttConfigValues({
            ...mqttConfigValues,
            [name]: event.target.value
        });
    };

    const clickSubmit = async (e) => {
        e.preventDefault();
        const mqttConfig = { PORT, HOST, USERNAME, PASSWORD, PROTOCOL };
                
        try {
            const res = await fetch(`${API}/mqttConfig`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(mqttConfig)
            });
                    
            const data = await res.json()
            if (data.status) {
                setMqttConfigValues(data.prevSettings);
            } else {
                throw new Error("Error updating config")
            }
        } catch (err) {
            alert("Error updating config: ", err)
        }  
    };

    // ---------------------------------------------------------------------
    // get last config details
    const fetchPrevSettings = async () => {
        const res = await fetch(`${API}/getPrevMqttSetting`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        const data = await res.json()
        setMqttConfigValues(data.prevSettings);
    }

    useEffect(() => {
        fetchPrevSettings()
    }, [])
    // ---------------------------------------------------------------------

    return (
        <div className='mqtt-settings--form-wrapper'>
            <form onSubmit={clickSubmit} className='mqtt-settings--form'>
                <div className="mqtt-settings--form-group">
                    <label>Port Number<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("PORT")}
                        type="text"
                        className="mqtt-settings-inputFieldArea"
                        value={PORT}
                        required
                    />
                </div>
                <div className="mqtt-settings--form-group">
                    <label>Host<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("HOST")}
                        type="text"
                        className="mqtt-settings-inputFieldArea"
                        value={HOST}
                        required
                    />
                </div>
                <div className="mqtt-settings--form-group">
                    <label>User Name<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("USERNAME")}
                        type="text"
                        className="mqtt-settings-inputFieldArea"
                        value={USERNAME}
                        required
                    />
                </div>
                <div className="mqtt-settings--form-group">
                    <label>Password<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("PASSWORD")}
                        type="password"
                        className="mqtt-settings-inputFieldArea"
                        value={PASSWORD}
                        required
                    />
                </div>
                <div className="mqtt-settings--form-group">
                    <label>Protocol<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("PROTOCOL")}
                        type="text"
                        className="mqtt-settings-inputFieldArea"
                        value={PROTOCOL}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className='mqtt-settings--button'
                >
                    Save Changes
                </button>
            </form>
        </div>
    )
}

export default MqttSettings