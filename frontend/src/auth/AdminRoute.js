import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, isAdmin } from "./index";

const AdminRoute = ({ children }) => {
    const auth = isAuthenticated() && isAdmin(); // isAuthenticated() returns true or false based on localStorage
    if (auth) {
        return children;
    } else {
        alert("Admin content. Access Denied!");
        return <Navigate to="/" />;
    }
};

export default AdminRoute;