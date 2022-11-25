import mongoose from 'mongoose'
import config from '../../config/defaults.mjs'
const {connect} = mongoose;
import pino from 'pino'
const logger = pino()

export const connectDB = async (app)=>{
    try{
        logger.info(`Connecting to MongDB database ...`);
        mongoose.connect(`${config.localMongod}`,
            () => {
                app.listen(config.port, () => {
                    logger.info(`Server started on port ${config.port} in ${config.env} mode.`);
                });
            });
        logger.info("MongoDB connected Successfully...");
    }catch(error){
        logger.info('Error while connecting to the database. Try again...');
    }
}

export default connectDB