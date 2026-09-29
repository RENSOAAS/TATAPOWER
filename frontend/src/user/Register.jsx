import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import { API } from "../config";
import "./register.css";
import backgroundImage from "../assets/tata_login_logo.png";

const Register = () => {
    const [values, setValues] = useState({
        first_name: '',
        last_name: '',
        email: '',
        user_name: '',
        password: '',
        error: '',
        success: false
    });

    const { first_name, last_name, email, user_name, password, error, success } = values;

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
        const user = { first_name, last_name, email, user_name, password };
        
        try {
            const res = await fetch(`${API}/register`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });
            const resData = await res.json();
            // console.log(resData);
            if (resData.status) {
                setValues({
                    ...values,
                    first_name: '',
                    last_name: '',
                    email: '',
                    user_name: '',
                    password: '',
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
            User registered Successfully!
            <Link className="login--light-color register-here--link" to="/login"> Login</Link>
        </div>
        
    );
    
    const registerForm = () => {
        return (
            <div className='login--form'>
                {/* Error Success Message */}
                {showError()}
                {showSuccess()}
                <form onSubmit={clickSubmit} className='login--input-field-form'>
                    <div className="login--form-group">
                        <label>First Name<span style={{ color: "#E98300" }}>*</span></label>
                        <input
                            onChange={handleChange("first_name")}
                            type="text"
                            className="login--input-area form-control text-muted"
                            value={first_name}
                        />
                    </div>
                    <div className="login--form-group">
                        <label>Last Name<span style={{ color: "#E98300" }}>*</span></label>
                        <input
                            onChange={handleChange("last_name")}
                            type="text"
                            className="login--input-area form-control text-muted"
                            value={last_name}
                        />
                    </div>
                    <div className="login--form-group">
                        <label>E-mail<span style={{ color: "#E98300" }}>*</span></label>
                        <input
                            onChange={handleChange("email")}
                            type="email"
                            className="login--input-area form-control text-muted"
                            value={email}
                        />
                    </div>
                    <div className="login--form-group">
                        <label>User Name<span style={{ color: "#E98300" }}>*</span></label>
                        <input
                            onChange={handleChange("user_name")}
                            type="text"
                            className="login--input-area form-control text-muted"
                            value={user_name}
                        />
                    </div>
                    <div className="login--form-group">
                        <label>Password<span style={{ color: "#E98300" }}>*</span></label>
                        <input
                            onChange={handleChange("password")}
                            type="password"
                            className="login--input-area form-control text-muted"
                            value={password}
                        />
                    </div>
                        
                    <button
                        type="submit"
                        className='login--button'
                    >
                        Register
                    </button>
                </form>
            </div>
        );
    };

    return (
        <div className="login--container">
            <img className="login--background" src={backgroundImage} loading="lazy" alt="login_background" />
            <div className="login--block-wrapper">
                <h1 className="login--heading">Register</h1>
                {/* Register form */}
                {registerForm()}
            </div>
        </div>
    );
};

export default Register;