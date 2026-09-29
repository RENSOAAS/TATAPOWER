import React, { useState } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { AiOutlineClose, AiOutlineMenuUnfold } from "react-icons/ai";
import Clock from 'react-live-clock';
import Moment from "moment";

import { isAdmin, logout } from "../auth"
import Logo from '../assets/Tata_Power_Logo.png';
import "./navbar.css";

const Navbar = () => {
    const [showMenu, setShowMenu] = useState(false);

    // To display date and time clock on navbar
    const n = Moment(new Date()).format("DD-MM-yyyy");
    const day = new Date().toDateString().split(' ')[0];

    let iconStyle = { color: "#426C2A" };

    return (
        <>
            <div className="navbar-wrapper">
                <nav className="navbar-container">
                    {/* Hamburger Menu */}
                    <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
                        {showMenu ? <AiOutlineClose size={30} style={iconStyle} /> : <AiOutlineMenuUnfold size={30} style={iconStyle} />}
                    </div>

                    {/* Logo(s) will go here */}
                    <NavLink className="logo-container" to='/'>
                        <img className="tata-logo" src={Logo} alt="/" />
                    </NavLink>

                    {/* Menu */}
                    <div className={`menu-items ${showMenu ? "active" : ""}`}>
                        <ul>
                            <li>
                                <NavLink
                                    className={({ isActive }) => (isActive ? 'tab-is-active' : 'tab-is-not-active')}
                                    to="/"
                                    end
                                >
                                    Dashboard
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    className={({ isActive }) => (isActive ? 'tab-is-active' : 'tab-is-not-active')}
                                    to="/reports"
                                >
                                    Reports
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    className={({ isActive }) => (isActive ? 'tab-is-active' : 'tab-is-not-active')}
                                    to="/graphs"
                                >
                                    Graphs
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    className={({ isActive }) => (isActive ? 'tab-is-active' : 'tab-is-not-active')}
                                    to="/logs"
                                >
                                    Logs
                                </NavLink>
                            </li>
                            <li style={{ display: isAdmin() ? 'block' : 'none' }}>
                                <NavLink
                                    className={({ isActive }) => (isActive ? 'tab-is-active' : 'tab-is-not-active')}
                                    to="/settings"
                                >
                                    Settings
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    style={{ color: "#1C4C00", fontWeight: "700" }}
                                    onClick={() =>
                                        logout(() => {
                                            <Navigate to="/login" replace={true} />;
                                        })
                                    }
                                    to="/login"
                                >
                                    Logout
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Clock */}
                    <div className="navbar--clock-container">
                        <h4>{n}</h4>
                        <h3>{day}  <Clock format={'HH:mm A'} ticking={true} /></h3>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Navbar;
