import joi from 'joi';

export const jobValidation = (job)=>{
    const schema = joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        email: joi.string().email().required(),
        address: joi.string().required(),
        company: joi.string().required(),
        industry: joi.required(),
        jobType: joi.string().required(),
        minEducation: joi.string().required(),
        positions: joi.required(),
        experience: joi.string().required(),
        salary: joi.string().required(),
    }).unknown();
    return schema.validate(job)
}

