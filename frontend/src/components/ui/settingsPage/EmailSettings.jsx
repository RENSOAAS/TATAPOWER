import React, { useState, useEffect } from 'react'
import { API } from '../../../config';
import "./emailSettings.css"

const EmailSettings = () => {
    const [emailConfigValues, setEmailConfigValues] = useState({
        HOST: '',
        PORT: '',
        EMAIL: '',
        PASSWORD: ''
    });
    const { HOST, PORT, EMAIL, PASSWORD } = emailConfigValues

    const handleChange = name => event => {
        setEmailConfigValues({
            ...emailConfigValues,
            [name]: event.target.value
        });
    };

    const clickSubmit = async (e) => {
        e.preventDefault();
        
        setEmailConfigValues({ ...emailConfigValues });
        const emailConfig = { HOST, PORT, EMAIL, PASSWORD };

        try {
            const res = await fetch(`${API}/emailConfig`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(emailConfig)
            });
            const data = await res.json()
            if (data.status) {
                setEmailConfigValues(data.prevSettings);
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
        const res = await fetch(`${API}/getPrevEmailSetting`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        const data = await res.json()
        setEmailConfigValues(data.prevSettings);
    }

    useEffect(() => {
        fetchPrevSettings()
    }, [])
    // ---------------------------------------------------------------------

    return (
        <div className='email-settings--form-wrapper'>
            <form onSubmit={clickSubmit} className='email-settings--form'>
                <h2>Note:- Email settings to email reports.</h2>
                <div className="email-settings--form-group">
                    <label>Host<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("HOST")}
                        type="text"
                        className="email-settings-inputFieldArea"
                        value={HOST}
                        required
                    />
                </div>
                <div className="email-settings--form-group">
                    <label>Port Number<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("PORT")}
                        type="text"
                        className="email-settings-inputFieldArea"
                        value={PORT}
                        required
                    />
                </div>
                <div className="email-settings--form-group">
                    <label>Email<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("EMAIL")}
                        type="text"
                        className="email-settings-inputFieldArea"
                        value={EMAIL}
                        required
                    />
                </div>
                <div className="email-settings--form-group">
                    <label>Password<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("PASSWORD")}
                        type="password"
                        className="email-settings-inputFieldArea"
                        value={PASSWORD}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className='email-settings--button'
                >
                    Save Changes
                </button>
            </form>
        </div>
    )
}

export default EmailSettings