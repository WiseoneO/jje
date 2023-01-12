import express, { json } from "express";
let app = express();
import config from "./src/config/defaults.mjs";
import {connectDB} from "./src/infrastructure/datatbase/mongoose.mjs";
import jobRoute from './src/interface/http/routes/jobs.mjs';
import authRouth from './src/interface/http/routes/auth.mjs';
import userRouth from './src/interface/http/routes/user.mjs';
import errorMiddleware from './src/interface/http/middlewares/errors.mjs';
import ErrorHandler from './src/interface/http/utils/errorHandler.mjs';
import pino from 'pino';
const logger = pino();

// handling uncaught exception
process.on('uncaughtException', err=>{
    logger.info(`Error ${err.message}`)
    logger.info(`Shutting down due to uncaught exceptions...`)
    process.exit(1);
});

// Database connection trigger
connectDB();

app.use(json());

// Base route
app.get('/api/v1', (req, res)=>{
    res.status(200).json({
        success: true,
        env: config.env,
        Project_Name: config.projectName
    })
})

app.use("/api/v1/", jobRoute);
app.use('/api/v1/auth', authRouth)
app.use('/api/v1/user', userRouth)

// Handle unhandle Routes
app.all('*', (req, res, next)=>{
    next(new ErrorHandler(`${req.originalUrl} route Not found!`, 404))
});

// Middleware to handle errors
app.use(errorMiddleware);

const server = app.listen(config.port, () => {
    logger.info(`Server started on port ${config.port} in ${config.env} mode.`);
});

//  Handling unhandled promise rejection
process.on('unhandledRejection', err=>{
    logger.info(`Error: ${err.message}`);
    logger.info(`Shutting down the server due to Unhandled promise rejection...`);
        server.close(()=>{
            process.exit(1)
        });
});