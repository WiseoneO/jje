import jobModel from '../../../infrastructure/datatbase/models/job.mjs'
import {jobValidation} from '../validations/jobValidation.mjs';
import geoCoder from '../utils/geocoder.mjs';
import ErrorHandler from '../utils/errorHandler.mjs';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.mjs';
import ApiFilters from '../utils/apiFilters.mjs';
import path from 'path'
import config from '../../../config/defaults.mjs';

export const newJob = async (req, res)=>{
    try{
         req.body.user = req.user.id;

        // validate user input
        const {error} = jobValidation(req.body);
            if(error){
                return res.status(400).json({
                    success: false,
                    msg: `${error.details[0].path}, is required.`
                });
            }
        
        // Adding user id to a created job
        const newJob = await jobModel.create(req.body);

        return res.status(201).json({
            success : true,
            msg: 'Job created successfully',
            data: newJob
        })
    }catch(error){
        if(error instanceof Error){
            return res.status(500).json({
                success: false,
                msg: `${error.message}`
            })
        }
    }
}

export const getAllJobs = async (req, res)=>{
    try{
        const apiFilters = new ApiFilters(jobModel.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .searchByQuery()
        .pagination()
        const result = await apiFilters.query;

        if(result.length == 0){ 
            return next(new ErrorHandler("Jobs Not Found!", 404))
        }

        return res.status(200).json({
            success: true,
            total: result.length,
            msg: `Data retrieved successfully`,
            data: result
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
// Search jobs within a radius
export const getJobsInRadius = async (req, res)=>{
    try{
        const {zipcode, distance} = req.params;

        // Getting latitude and Longitude from geoCoder with zipcode
        const loc = await geoCoder.geocode(zipcode)
        const latitude =loc[0].latitude;
        const longitude = loc[0].longitude;

        // Radius of earth in miles
        const radius = distance / 3963

        const jobs = await jobModel.find({
            location: {$geoWithin: {$centerSphere: [[longitude, latitude], radius]}}
        });

        return res.status(200).json({
            success : true,
            msg: `Jobs retrived`,
            result: jobs.length,
            data: jobs
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

// Update a job
export const updateJob = catchAsyncErrors(async (req, res, next)=>{
        const payload = req.body;
        const jobId = req.params.id
        // Validating the input
        const {error} = jobValidation(payload);
            if(error){
                return res.status(401).json({
                    success: false,
                    msg: error.details[0].message
                });
            }

        let job = await jobModel.findById(jobId);
        if(!job){
            return next(new ErrorHandler("Job Not Found!", 404))
        }
        // Check if the user is the owner
        if(jobModel.user.toString() !== req.use.id && req.user.role !=='admin'){
            throw new Error(`${req.user.id} is not allowed to update this job`)
        }

        const updatedJob = await jobModel.findOneAndUpdate({_id: jobId}, payload, {new: true});
        return res.status(200).json({
            success: true,
            msg: `Job updated successfully.`,
            data: updatedJob
        })
})

// Delete a job
export const deleteJob = async (req, res)=>{
    try{
        const jobId = req.params.id;
        let job = await jobModel.findByIdAndRemove({_id: jobId});


        if(!job){
            return next(new ErrorHandler("Job Not Found!", 404))
        }

        // Check if the user is the owner
        if(jobModel.user.toString() !== req.use.id && req.user.role !=='admin'){
            throw new Error(`${req.user.id} is not allowed to delete this job`)
        }

        // Deleting Files associated with job
        const delJob = await jobModel.findOne({_id: req.params.id});

        for(let i=0; i<delJob.applicantAppied.length; i++){
            let filepath = `${__dirname}../../../public/uploads/${delJob.applicantAppied[i].resume}`.replace('\\controllers', '');

            fs.unlink(filepath, err=> {
                if(err) return console.log(err);
            });
        }
        return res.status(200).json({
            success : true,
            msg:`Job deleted successfully`
        })

    }catch(error){
        if(error){
            return res.status(400).json({
                success: false,
                msg: `${error.message}`
            })
        }
    }
}

// Get a single job by id and slug
export const getJob = async (req, res)=>{
    try{
        const job = await jobModel.find({$and: [{_id: req.params.id},{slug: req.params.slug}]})
        .populate({
            path: 'user',
            select: 'name'
        });
        if(!job || job.length === 0) {
            return res.status(404).json({
                success: false,
                msg: `Job not found`
            });
        }

        return res.status(200).json({
            success: true,
            msg: `Data retrieved successfully`,
            data: job
        })
    }catch(error){
        if(error){
            return res.status(500).json({
                success: false,
                msg: `${error.message}`
            })
        }
    }
}

// Get stats about a topic(job)
export const jobStats = async (req, res)=>{
    try{
        const stats = await jobModel.aggregate([
            {
                $match: {$text: {$search: "\""+req.params.topic + "\""}}
            },
            {
                $group: {
                    _id: {$toUpper: '$experience'},
                    totalJobs: {$sum: 1},
                    avgPosition: {$avg: '$positions'},
                    avgSalary: {$avg: '$salary'},
                    miniSalary: {$min: '$salary'},
                    maxSalary: {$max:  '$salary'}
                }
            }
        ]);
        
        if(!stats || stats.length===0){
            return res.status(404).json({
                success: false,
                msg: `No stats found for - ${req.params.topic}`
            })
        }

        return res.status(200).json({
            success: true,
            msg: `Data retrieved.`,
            data: stats
        })
    }catch(error){
        if(error){
            return res.status(500).json({
                success: false,
                msg: `${error.message}`
            })
        }
    }
}

export const apply = catchAsyncErrors(async(req, res)=>{
    let job = await jobModel.findById(req.params.id).select('+applicantAppied');
 
    if(!job) throw new Error('Job not found!')
 
     //    check that job last date has been pass
     if(job.lastDate < new Date(Date.now())){
         return res.status(400).json({
             success: false,
             msg: 'You cannot apply for this job. Date is over.'
         })
     }

    //  Check if user has applied before
    for(let i=0; i<job.applicantAppied.length; i++){
        if(job.applicantAppied[i].id === req.user.id){
            throw Error('you have already applied to this job')
        }
    }
    
     // check the files
     if(!req.files){
         throw new Error('Please uplolad file.')
     }
 
     let file = req.files.file;
 
     // check file type
     const supportedFiles = /.docs|.pdf/;
     if(!supportedFiles.test(path.extname(file.name))){
          throw  Error('Please upload document file.')
         };
 
 
     // check document size
     if(file.size > config.max_file_size){
         throw Error('Please upload file less than 2MB') 
     }
 
     // Renaming resume
     file.name = `${req.user.name.replace(' ', '_')}_${job._id}${path.parse(file.name).ext}`
 
     // store file
     file.mv(`${config.upload_path}/${file.name}`, async err=>{
         if(err){
             console.log(err);
             return next(new Error('resume upload failed.'))
         }
 
         await jobModel.findByIdAndUpdate(req.params.id, {$push: {
             applicantAppied: {
                 id: req.user.id,
                 resume: file.name
             }
         }}, {new: true})
     })
     return res.status(200).json({
         success : true,
         msg: `Applied to Job successfully.`,
         data: file.name
     })
 })