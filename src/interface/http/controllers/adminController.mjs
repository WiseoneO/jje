import userModel from '../../../infrastructure/datatbase/models/user.mjs'
import jobModel from '../../../infrastructure/datatbase/models/job.mjs'
import catchAsyncErrors from '../middlewares/catchAsyncErrors.mjs'
import ErrorHandler from '../utils/errorHandler.mjs';
import ApiFilters from '../utils/apiFilters.mjs';
import fs from 'fs';
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import user from '../../../infrastructure/datatbase/models/user.mjs';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


// Show all users
export const getUsers = catchAsyncErrors(async(req, res)=>{
    const apiFilters = new ApiFilters(userModel.find(), req.query)
    .filter()
    .sort()
    .pagination();

    const users = await apiFilters.query;

    res.status(200).json({
        success: true,
        result: users.length,
        data: users
    })
});

// Deleta user
export const deleteUser = catchAsyncErrors(async(req, res)=>{
    const user = await userModel.findById(req.params.id);

    if(!user) throw new Error('User not found.');

    deleteUserData(user.id, user.role);
    await user.remove();

    res.status(200).json({
        success: true,
        message: 'User is deleted by admin.'
    });
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