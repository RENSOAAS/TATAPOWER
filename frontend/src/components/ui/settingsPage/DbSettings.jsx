import React, { useEffect, useState } from 'react'
import { API } from '../../../config';
import "./dbSettings.css"

const DbSettings = () => {
    const [dbConfigValues, setDbConfigValues] = useState({
        HOST: '',
        PASSWORD: '',
        DB_PORT: '',
        DATABASE: '',
        USER: '',
    });
    const { HOST, PASSWORD, DB_PORT, DATABASE, USER } = dbConfigValues

    const handleChange = name => event => {
        setDbConfigValues({
            ...dbConfigValues,
            [name]: event.target.value
        });
    };

    // Update the db settings on save
    const clickSubmit = async (e) => {
        e.preventDefault();
        const dbConfig = { HOST, PASSWORD, DB_PORT, DATABASE, USER };
                
        try {
            const res = await fetch(`${API}/dbConfig`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dbConfig)
            });
                    
            const data = await res.json()
            if (data.status) {
                setDbConfigValues(data.prevSettings);
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
        const res = await fetch(`${API}/getPrevDbSetting`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        const data = await res.json()
        setDbConfigValues(data.prevSettings);
    }

    useEffect(() => {
        fetchPrevSettings()
    }, [])
    // ---------------------------------------------------------------------


    return (
        <div className='db-settings--form-wrapper'>
            <form onSubmit={clickSubmit} className='db-settings--form'>
                <div className="db-settings--form-group">
                    <label>Host<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("HOST")}
                        type="text"
                        className="db-settings-inputFieldArea"
                        value={HOST}
                        required
                    />
                </div>
                <div className="db-settings--form-group">
                    <label>Password<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("PASSWORD")}
                        type="password"
                        className="db-settings-inputFieldArea"
                        value={PASSWORD}
                        required
                    />
                </div>
                <div className="db-settings--form-group">
                    <label>Port Number<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("DB_PORT")}
                        type="text"
                        className="db-settings-inputFieldArea"
                        value={DB_PORT}
                        required
                    />
                </div>
                <div className="db-settings--form-group">
                    <label>Database Name<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("DATABASE")}
                        type="text"
                        className="db-settings-inputFieldArea"
                        value={DATABASE}
                        required
                    />
                </div>
                <div className="db-settings--form-group">
                    <label>User<span style={{ color: "#426C2A" }}>*</span></label>
                    <input
                        onChange={handleChange("USER")}
                        type="text"
                        className="db-settings-inputFieldArea"
                        value={USER}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className='db-settings--button'
                >
                    Save Changes
                </button>
            </form>
        </div>
    )
}

export default DbSettings