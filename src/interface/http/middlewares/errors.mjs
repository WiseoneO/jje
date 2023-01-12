import config from '../../../config/defaults.mjs'
import ErrorHandler from '../utils/errorHandler.mjs';

const errorMiddleware = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    if(config.env === 'development'){
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        });

    }

    if(config.env === 'production'){
        let error = {...err};
        error.message = err.message;

        // Wrong mongoose Object Id Error
        if(err.name === 'CastError'){
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new ErrorHandler(message, 404);
        };
        // Handles mongoose duplicate key error
        if(err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered. `;
            error = new ErrorHandler(message, 400);
        };

        res.status(err.statusCode).json({
            success: false,
            message: error.message || `Internal Serval Error`
        })
    }
}

export default errorMiddleware