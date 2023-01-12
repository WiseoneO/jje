import jwt from 'jsonwebtoken';
import config from '../../../config/defaults.mjs';
import ErrorHandler from '../utils/errorHandler.mjs';

export const verifyToken = async (req, res, next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return  res.status(401).json({
            success : false,
            message : "Access denied!"
        })
    }

    const token = authHeader.split(' ')[1];

    try{
        const verified = jwt.verify(token, config.userSecret);
        req.user = verified;
        next()
    }catch(error){
        if (error.name === 'JsonWebTokenError') {
            res
              .status(400)
              .json({ success: false, msg: `Invalid web token. try again!`});
        }else if(error.name === 'TokenExpiredError'){
            res
            .status(400)
            .json({ success: false, msg: `Json web token is expired. Try again!`});
        }
    }
}

// handling Users roles
export const authorizeRole = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            next(new ErrorHandler(`Role ${req.user.role} is not allowed to access this resource`))
            }
        next()
    }
}