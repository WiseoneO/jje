import userModel from '../../../infrastructure/datatbase/models/user.mjs';
import { changedPassword,updateUserData} from '../validations/userValidations.mjs';
import config from '../../../config/defaults.mjs';
import ErrorHandler from '../utils/errorHandler.mjs';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.mjs';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jobModel from '../../../infrastructure/datatbase/models/job.mjs';
import fs from 'fs';
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import user from '../../../infrastructure/datatbase/models/user.mjs';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const userProfile = catchAsyncErrors(async(req, res)=>{
    const user = await userModel.findById(req.user.id).populate({
        path: 'jobsPublished',
        select: 'title postingDate'
    });

    delete user._doc.password;
    res.status(200).json({
        success: true,
        data:user
    })
});

export const changePassword = catchAsyncErrors(async(req, res)=>{
    let {newPassword, currentPassword} = req.body;

    const {error} = changedPassword({newPassword,currentPassword});
    if(error){
        return res.status(400).json({
            success: false,
            msg: `${error.details[0].path}, is required.`
        });
    }

    const user = await userModel.findById(req.user.id);

    // check previous user password
    const isMatched = await bcrypt.compare(currentPassword, user.password)
    if(!isMatched) return res.status(401).json({
        success: false,
        msg: `Old password is incorrect!`
    });

    let encryptPassword = await bcrypt.hash(newPassword, 12)
    user.password = encryptPassword;
    await user.save();

    res.status(200).json({
        success : true,
        msg: `Password changed successfully.`
    })
})
export const updateUser = catchAsyncErrors(async(req, res)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const {error} = updateUserData(newUserData);
    if(error){
        return res.status(400).json({
            success: false,
            msg: `${error.details[0].path}, is required.`
        });
    }
    const user = await userModel.findByIdAndUpdate(req.user.id, newUserData, {new: true});

    delete user._doc.password
    return res.status(200).json({
        success : true,
        msg: `User record updated.`,
        data: user
    })
})

export const deleteUser = catchAsyncErrors(async(req, res)=>{
    deleteUserData(req.user.id, req.user.role)
    const user = await userModel.findByIdAndDelete(req.user.id);

    if(!user) return res.status(404).json({
        success: false,
        msg:'No user found'
    })


    return res.status(200).json({
        success : true,
        msg: `Your account has been deleted.`,
        data: user
    })
})

// SHow all applied Jobs
export const getAppliedJobs = catchAsyncErrors(async(req, res)=>{
    const jobs = await jobModel.find({'applicantAppied.id': req.user.id}).select('+applicantAppied');

    res.status(200).json({
        success : true,
        msg: `Jobs retrived successfully`,
        result: jobs.length,
        data: jobs 
    })
})

// Show all jobs published by employer
export const getPublishedJobs = catchAsyncErrors(async(req, res)=>{
    const jobs = await jobModel.find({user: req.user.id});

    res.status(200).json({
        success : true,
        msg: `Jobs retrived successfully`,
        result: jobs.length,
        data: jobs 
    })
})



// Delete user files and employers jobs
async function deleteUserData(user, role){
    if(role === 'employer'){
        await jobModel.deleteMany({user: user});
    }

    if(role === 'user'){
        const appliedJobs = await jobModel.find({'applicantAppied.id': user}).select('+applicantAppied');

        // search for the applicant Id
        for(let i=0; i<appliedJobs.length; i++){
            let obj = appliedJobs[i].applicantAppied.find(o => o.id === user);

            let filepath = `${__dirname}../../../public/uploads/${obj.resume}`.replace('\\controllers', '');

            fs.unlink(filepath, err=> {
                if(err) return console.log(err);
            });

            appliedJobs[i].applicantAppied.splice(appliedJobs[i].applicantAppied.indexOf(obj.id));

            await appliedJobs[i].save();
        }
    }
}


