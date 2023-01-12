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
        if (error instanceof Error) {
            res
              .status(400)
              .json({ success: false, msg: `${error.message}` });
            throw new Error(error.message);
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