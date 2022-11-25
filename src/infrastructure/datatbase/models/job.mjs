import mongoose from "mongoose";
const {Schema, model} = mongoose;
import validator from 'validator';
import slugify from 'slugify';
import geoCoder from '../../../interface/http/utils/geocoder.mjs'

const jobSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please enter job title'],
        trim: true,
        maxlength: [100, 'Job title cannot exceed 100 characters.']
    },
    slug: String,
    description: {
        type :String,
        required: [true, 'Please enter job description'],
        maxlength: [1000, 'Job description cannot exceed 1000 characters'],
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'Please add a valid email'],
    },
    address : {
        type: String,
        required: [true, 'Please add an address.'],
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress : String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    company: {
        type: String,
        required: [true, 'Please add company name.']
    },
    industry: {
        type: [String],
        required: true,
        enum : {
            values: [
                'Business', 
                'Information Technology', 
                'Banking', 
                'Education/Training', 
                'telecommunication',
                'Others'
            ],
            message: 'Please select correct options for industry.'
        },
    },
    jobType: {
        type: String,
        required: true,
        enum : {
            values: [
                'Permanent',
                'Temporary',
                'Internship'
            ],
            message: 'Please select correct options for job type.'
        }
    },
    minEducation: {
        type: String,
        required: true,
        enum: {
            values: [
                'Bachelors',
                'Masters',
                'Phd'
            ],
            message: 'Please select correct options for education.'
        }
    },
    positions: {
        type: Number,
        default: 1
    },
    experience: {
        type: String,
        required: true,
        enum: {
            values : [
                'No Experience',
                '1 year - 2 years',
                '2 years - 5 years',
                '5 years+',
            ],
            message: 'Please select correct option for experience.'
        }
    },
    salary: {
        type: Number,
        required: [true, 'Please please enter expected salary for this job.']
    },
    postingDate: {
        type: Date,
        default: Date.now
    },
    lastDate: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 7)
    },
    applicantAppied: {
        type : [Object],
        select: false
    },
});

// Creating Job slug before saving
jobSchema.pre('save', function(next){
    // Creating slug before saving to DB
    this.slug = slugify(this.title, {lower: true});

    next()
})

// setting up location
jobSchema.pre('save', async function(next){
    const loc = await geoCoder.geocode(this.address);
    
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress : loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }
});
export default model('jobModel', jobSchema);