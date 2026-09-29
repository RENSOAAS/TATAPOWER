import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { authenticate } from "../auth";
import { API } from "../config";
import "./login.css";

import backgroundImage from "../assets/tata_login_logo.png";

const Login = () => {
    const [rememberMe, setRememberMe] = useState(false);
    const [values, setValues] = useState({
        user_name: '',
        password: '',
        error: '',
        loading: false,
        redirectToReferrer: false,
    });

    const { user_name, password, error, loading, redirectToReferrer } = values;

    const handleChange = name => event => {
        setValues({
            ...values,
            error: false,
            [name]: event.target.value
        });
    };
    
    const clickSubmit = async (e) => {
        e.preventDefault();
        setValues({ ...values, error: false, loading: true });
        const user = { user_name, password };
        
        try {
            const res = await fetch(`${API}/login`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });
            const resData = await res.json();
            if (resData.status) {
                authenticate(resData, () => {
                    setValues({ ...values, redirectToReferrer: true });
                });
                setCookie()
            }
    
            if (!resData.status) {
                setValues({ ...values, error: resData.message, loading: false });
            }
        } catch (err) {
            setValues({ ...values, loading: false, error: err.message });
        }
    };

    // Remeber Me
    function handleRememberMeChange(event) {
        setRememberMe(event.target.checked);
    }

    function setCookie() {
        var u = document.getElementById("user_name").value;
        var p = document.getElementById("password").value;
        
        var cookieExpiration = "";
        if (rememberMe) {
            var expirationDate = new Date();
            // Set cookie expiration date to 30 days from now
            expirationDate.setDate(expirationDate.getDate() + 30);
            cookieExpiration = "; expires=" + expirationDate.toUTCString();
        }
        
        document.cookie = "userName=" + u + "; path=/"+ cookieExpiration;
        document.cookie = "password=" + p + "; path=/"+ cookieExpiration;
    };
    
    // Show loading or Error
    const showError = () => (
        <div
            className='alert alert-danger'
            style={{ display: error ? '' : 'none' }}
        >
            {error}
        </div>
    );

    const showLoading = () =>
        loading && (
            <div className="alert alert-info">
                <h4>Loading...</h4>
            </div>
        );
    
    const redirectUser = () => {
        if (redirectToReferrer) {
            return <Navigate to="/" replace={true} end />;
        }
    };

    // Login From
    const loginForm = () => {
        return (
            <div className="login--form">
                <form className="login--input-field-form" onSubmit={clickSubmit}>
                    {showError()}
                    {showLoading()}
                    <div className="login--form-group">
                        <label>User Id<span style={{ color: "#66B538" }}>*</span></label>
                        <input
                            id="user_name"
                            onChange={handleChange("user_name")}
                            type="text"
                            className="login--input-area"
                            value={user_name}
                        />
                    </div>
                    <div className="login--form-group">
                        <label>Password<span style={{ color: "#66B538" }}>*</span></label>
                        <input
                            id="password"
                            onChange={handleChange("password")}
                            type="password"
                            className="login--input-area"
                            value={password}
                        />
                    </div>
                    <div className="login--remember-me-forgot-password">
                        <label>
                            <input type="checkbox" id="remember_me" className="remember-me" onChange={handleRememberMeChange} />
                            Remember Me
                        </label>
                        
                        {/* <Link className="forgot-password">Forgot Password ?</Link> */}
                    </div>
                    <button className="login--button">Login</button>
                </form>
            </div>
        );
    };
    
    return (
        <div className="login--container">
            
            <img className="login--background" src={backgroundImage} loading="lazy" alt="login_background" />

            <div className="login--block-wrapper">
                <h1 className="login--heading">Login</h1>
                
                {/* Login form */}
                {loginForm()}
                {redirectUser()}

                <p className="login--register-here">You don't have an account ?
                    <Link className="login--light-color register-here--link" to="/register"> Register here</Link>
                </p>
            </div>
                        
        </div>
    );
};

export default Login;