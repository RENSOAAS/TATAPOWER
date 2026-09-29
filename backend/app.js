const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// import routes
const scheduler = require("./controllers/Scheduler/scheduler");
const database = require("./Routes/Database");
const authRoutes = require("./Routes/Auth");
const configRoute = require("./Routes/configRoute");
const usersRoutes = require("./Routes/usersRoutes");
const machineRoutes = require("./Routes/machineRoutes");
const reportsRoutes = require("./Routes/reportsRoutes");
const settingRoutes = require("./Routes/settingRoutes");
const logRoutes = require("./Routes/logsRoutes");
const graphRoutes = require("./Routes/graphRoutes");
const deleteOldData = require("./Routes/deleteOldData");
const generationRoutes = require("./Routes/generationRoutes");
const communicationRoutes = require("./Routes/communicationRoutes");

// app
const app = express();
const port = process.env.PORT || 8000;

// middlewares
app.use(express.json());
app.use(cors());

app.use(bodyParser.json());
app.use(cookieParser());

// Routes middlewares
app.use("/database", database);
app.use("/api", authRoutes);
app.use("/api", configRoute);
app.use("/api", machineRoutes);
app.use("/api", reportsRoutes);
app.use("/api", usersRoutes);
app.use("/api", settingRoutes);
app.use("/api", logRoutes);
app.use("/api", graphRoutes);
app.use("/api", deleteOldData);
app.use("/api", generationRoutes);
app.use("/api", communicationRoutes);

scheduler();

// module.exports = app;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});