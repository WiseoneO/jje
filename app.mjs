import express, { json } from "express";
let app = express();
import config from "./src/config/defaults.mjs";
import {connectDB} from "./src/infrastructure/datatbase/mongoose.mjs";
import jobRoute from './src/interface/http/routes/jobs.mjs';
import authRoute from './src/interface/http/routes/auth.mjs';
import userRoute from './src/interface/http/routes/user.mjs';
import adminRoute from './src/interface/http/routes/admin.mjs';
import errorMiddleware from './src/interface/http/middlewares/errors.mjs';
import ErrorHandler from './src/interface/http/utils/errorHandler.mjs';
import pino from 'pino';
const logger = pino();
import fileupload from 'express-fileupload';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize  from 'express-mongo-sanitize';
import  xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import bodyParser from 'body-parser';


// handling uncaught exception
process.on('uncaughtException', err=>{
    logger.info(`Error ${err.message}`)
    logger.info(`Shutting down due to uncaught exceptions...`)
    process.exit(1);
});

// Database connection trigger
connectDB();

// Setup bodyParser
app.use(bodyParser.urlencoded({extended: true}))
// Setup security headers
app.use(helmet())

app.use(json());

// Handle file uploads
app.use(fileupload())

//   Sanitize Data
app.use(mongoSanitize());

// Prevent XSS attack
app.use(xss())

// Prevent parameter pollution
app.use(hpp({
    whitelist: ['position']
}));

//   Rate limiting
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
})
// Apply the rate limiting middleware to all requests
app.use(limiter);

// Setup CORS - Accessible by other Domain
app.use(cors());

// Base route
app.get('/api/v1', (req, res)=>{
    res.status(200).json({
        success: true,
        env: config.env,
        Project_Name: config.projectName
    })
})

app.use("/api/v1", jobRoute);
app.use("/api/v1/admin", adminRoute);
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/user', userRoute)

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