import mongoose from 'mongoose'
import config from '../../config/defaults.mjs'
const {connect} = mongoose;
import pino from 'pino'
const logger = pino()

export const connectDB = ()=>{
    logger.info(`Connecting to MongDB database ...`);
    mongoose.connect(`${process.env.MONGODB_LIVE_CONNECTION}`, ()=>{
        logger.info(`Database Connected Successfully...`)
    });
}