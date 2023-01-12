import userModel from '../../../infrastructure/datatbase/models/user.mjs';
import { userValidation } from '../validations/userValidation.mjs';
import config from '../../../config/defaults.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import  {sendMail}  from '../../../infrastructure/libs/mail.mjs';

// Register Users
export const signUp = async(req, res)=>{
    try{
        let {name,password,confirmPassword, role, email} = req.body;
        const {error} = userValidation({name, password,confirmPassword,role, email});
            if(error){
                return res.status(400).json({
                    success: false,
                    msg: `${error.details[0].path}, is required.`
                });
            }
            // Check if the email exist
            const isUser = await userModel.findOne({email});
            if(isUser){
                return res.status(400).json({
                    success :false,
                    msg: 'Email already exist'
                })
            } 
            
            // Encrypt password
            let hashedPassword = await bcrypt.hash(password, 12);
            password = hashedPassword;

        const user = await userModel.create({
            name, email, password,role
        })

        delete user._doc.password;
        res.status(201).json({
            success : true,
            msg: `New user registed`,
            data: user
        })
        
    }catch(error){
        if(error instanceof Error){
            return res.status(400).json({
                success: false,
                msg: `${error}`
            })
        }
    }
}

// Login Users
export const login = async (req, res)=>{
    try{
        const {email, password} = req.body;
        // Verify user email
        const verifyEmail = await userModel.findOne({email: email});
        if(!verifyEmail){
            return res.status(400).json({
                success: false,
                msg: 'Invalid credentials'
            })
        }
        // Compare password wuth the stored data
        const verifyPassword = await bcrypt.compare(password, verifyEmail.password)
        if(!verifyPassword){
            return res.status(400).json({
                success: false,
                msg: 'Invalid credentials'
            })
        }
        // create JWT token
        const token = jwt.sign({
                id: verifyEmail._id, 
                name: verifyEmail.name,
                role: verifyEmail.role
            },config.userSecret,{expiresIn: config.expiresIn});
        
            return res.status(200).json({
                success: true,
                msg: `User logged in successfully`,
                token
            })
    }catch(error){
        if(error instanceof Error){
            return res.status(400).json({
                success: false,
                msg: `${error.message}`
            })
        }
    }
}

// Reset Pawword Token
export const forgotPassword = async(req, res)=>{
    try{
        const email = req.body;
        
        let resetToken = crypto.randomBytes(20).toString('hex');
        // Hash resetPassword Token
        resetToken = crypto.createHash('shake256').digest('hex');

        // check if the email entered already exist
        const user = await userModel.findOne(email);
        if(!user){
            return res.status(400).json({
                success :false,
                msg: 'User not found!',
            })
        }

        user.resetPasswordToken = resetToken;
        // Set token expiring time
        user.resetPasswordExpire = Date.now() + 30*60*1000;
        await user.save();

        // Create reset password link
        const resetLink = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`
        const message = `\n\nYour password reset link is as follows: \n\n Link: ${resetLink}\n
        If you have not requested this, then please ignore that.`
        
        try{
            await sendMail({
                email: user.email,
                subject: 'Elite Password Recovery',
                message
            });

            return res.status(200).json({
                success: true,
                msg: `Email sent successfully to: ${user.email}`,
            })
        }catch(error){
            if(error instanceof Error){
                res.status(400).json({
                    success: false,
                    msg: `Email not sent`,
                })
            }
        }
    }catch(error){
        if(error instanceof Error){
            return res.status(500).json({
                success: false,
                msg: `${error.message}`
            })
        }
    }
}
