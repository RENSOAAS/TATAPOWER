import React from "react";
import Navbar from "./Navbar";
import "./layout.css";

const Layout = ({ children }) => {
    return (
        <div className="layout-container">
            <div><Navbar /></div>
            <div className="children">{children}</div>
        </div>
    )
};

export default Layout;