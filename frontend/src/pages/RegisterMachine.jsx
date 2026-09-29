import React, { useState } from 'react';
import Layout from "../layout/Layout";
import { API } from "../config";
import "../styles/registerMachine.css";

const RegisterMachine = () => {
    const [values, setValues] = useState({
        wegid: '',
        state: '',
        district: '',
        area: '',
        sub_area: '',
        feeder_no: '',
        iot_sim_no: '',
        device_id: '',
        error: '',
        success: false
    });

    const { wegid, state, district, area, sub_area, feeder_no, iot_sim_no, device_id, error, success } = values;

    console.log(wegid);

    const handleChange = name => event => {
        setValues({
            ...values,
            error: false,
            [name]: event.target.value
        });
    };

    const clickSubmit = async (e) => {
        e.preventDefault();
        setValues({ ...values, error: false });
        const machineDetails = { wegid, state, district, area, sub_area, feeder_no, iot_sim_no, device_id };
        
        try {
            const res = await fetch(`${API}/registerMachine`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(machineDetails)
            });
            const resData = await res.json();
            if (resData.status) {
                setValues({
                    ...values,
                    wegid: '',
                    state: '',
                    district: '',
                    area: '',
                    sub_area: '',
                    feeder_no: '',
                    iot_sim_no: '',
                    device_id: '',
                    success: true
                });
            }
    
            if (!resData.status) {
                setValues({ ...values, error: resData.message });
            }
        } catch (err) {
            setValues({ ...values, success: false, error: err.message });
        }
        
    };
    
    const showError = () => (
        <div
            className='alert alert-danger'
            style={{ display: error ? '' : 'none' }}
        >
            {error}
        </div>
    );

    const showSuccess = () => (
        <div
            className='alert alert-info'
            style={{ display: success ? '' : 'none' }}
        >
            Machine ${wegid} registered Successfully!
        </div>
        
    );
    
    const registerMachineForm = () => {
        return (
            <div className='register-machine--form'>
                
                <h1 className='register-machine--heading'>Register Machine Form</h1>

                {showError()}
                {showSuccess()}

                <form onSubmit={clickSubmit} className='registerMachineInputField'>
                    <div className="register-machine--form-group">
                        <label>Wegid<span style={{ color: "#173C01" }}>*</span></label>
                        <input
                            onChange={handleChange("wegid")}
                            type="text"
                            className="register-machine--inputFieldArea form-control text-muted"
                            value={wegid.toUpperCase()}
                        />
                    </div>
                    <div className="register-machine--form-group">
                        <label>State<span style={{ color: "#173C01" }}>*</span></label>
                        <input
                            onChange={handleChange("state")}
                            type="text"
                            className="register-machine--inputFieldArea form-control text-muted"
                            value={state}
                        />
                    </div>
                    <div className="register-machine--form-group">
                        <label>District<span style={{ color: "#173C01" }}>*</span></label>
                        <input
                            onChange={handleChange("district")}
                            type="text"
                            className="register-machine--inputFieldArea form-control text-muted"
                            value={district}
                        />
                    </div>
                    <div className="register-machine--form-group">
                        <label>Area<span style={{ color: "#173C01" }}>*</span></label>
                        <input
                            onChange={handleChange("area")}
                            type="text"
                            className="register-machine--inputFieldArea form-control text-muted"
                            value={area}
                        />
                    </div>
                    <div className="register-machine--form-group">
                        <label>Sub-Area<span style={{ color: "#173C01" }}>*</span></label>
                        <input
                            onChange={handleChange("sub_area")}
                            type="text"
                            className="register-machine--inputFieldArea form-control text-muted"
                            value={sub_area}
                        />
                    </div>
                    <div className="register-machine--form-group">
                        <label>Feeder Number<span style={{ color: "#173C01" }}>*</span></label>
                        <input
                            onChange={handleChange("feeder_no")}
                            type="text"
                            className="register-machine--inputFieldArea form-control text-muted"
                            value={feeder_no}
                        />
                    </div>
                    <div className="register-machine--form-group">
                        <label>IoT Sim Number</label>
                        <input
                            onChange={handleChange("iot_sim_no")}
                            type="text"
                            className="register-machine--inputFieldArea form-control text-muted"
                            value={iot_sim_no}
                        />
                    </div>
                    <div className="register-machine--form-group">
                        <label>Device Id</label>
                        <input
                            onChange={handleChange("device_id")}
                            type="text"
                            className="register-machine--inputFieldArea form-control text-muted"
                            value={device_id}
                        />
                    </div>
                        
                        
                    <button
                        type="submit"
                        className='register-machine--button'
                    >
                        Register Machine
                    </button>
                </form>
            </div>
        );
    };

    return (
        <Layout>
            <div className='register-machine--container'>{registerMachineForm()}</div>
        </Layout>
    );
}

export default RegisterMachine;