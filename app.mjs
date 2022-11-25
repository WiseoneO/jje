import config from "./src/config/defaults.mjs";
import express, { json } from "express";
const app = express()
import {connectDB} from "./src/infrastructure/datatbase/mongoose.mjs";
import jobRoute from './src/interface/http/routes/jobs.mjs'
// Database connection trigger
connectDB(app);

app.use(json());


// Base route
app.get('/api/v1', (req, res)=>{
    res.status(200).json({
        success: true,
        env: config.env,
        Project_Name: config.projectName
    })
})


app.use("/api/v1/", jobRoute)
