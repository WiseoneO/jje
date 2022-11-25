import jobModel from '../../../infrastructure/datatbase/models/job.mjs'
import {jobValidation} from '../validations/jobValidation.mjs';
import geoCoder from '../utils/geocoder.mjs';

export const newJob = async (req, res)=>{
    try{
        const payload = req.body;

        // validate user input
        const {error} = jobValidation(payload);
            if(error){
                return res.status(401).json({
                    success: false,
                    msg: error.details[0].message
                });
            }
        const newJob = await jobModel.create(payload);
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
        const result = await jobModel.find();
        if(result.length == 0){ 
            return res.status(200).json({
                success: true,
                msg: `No job found`,
            })
        }

        return res.status(200).json({
            success: true,
            total: result.length,
            msg: `Data retrieved successfully`,
            data: result
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
            return res.status(500).json({
                success: false,
                msg: `${error.message}`
            })
        }
    }
}