import React, { Fragment } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

// User Routes
import Login from "./user/Login";
import Register from "./user/Register";
import PrivateRoute from "./auth/PrivateRoute";
import AdminRoute from "./auth/AdminRoute";
// Pages Routes
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Graphs from "./pages/Graphs";
import Logs from "./pages/Logs";
import RegisterMachine from "./pages/RegisterMachine";
import AdminReportsPage from "./pages/AdminReportsPage";
import Settings from "./pages/Settings";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Fragment>
                <Routes>
                    <Route exact path="/login" element={ <Login /> } />
                    <Route exact path="/register" element={<Register />} />
                    {/* Private routes that require login */}
                    <Route exact path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route exact path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                    <Route exact path="/graphs" element={<PrivateRoute><Graphs /></PrivateRoute>} />
                    <Route exact path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
                    <Route exact path="/registerMachine" element={<PrivateRoute><RegisterMachine /></PrivateRoute>} />
                    
                    <Route exact path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
                    <Route exact path="/adminReports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
                </Routes>
			</Fragment>
        </BrowserRouter>
    );
};

export default AppRoutes;