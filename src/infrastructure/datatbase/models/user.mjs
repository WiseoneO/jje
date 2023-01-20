import mongoose from "mongoose";
const {Schema, model} = mongoose;
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address,'],
        unique: true,
    },
    role: {
        type: String,
        enum: ['user', 'employer'],
        required: [true, 'Please select a role'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter a password for your account'],
        minlength: [8, 'Your password must be at least 8 characters long'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
},
    {
        toJSON: {virtuals: true},
        toObject: {virtuals:true}
    },
);

userSchema.virtual('jobsPublished', {
    ref: 'jobModel',
    localField: '_id',
    foreignField: 'user',
    justOne: false
  });
  


export default model('userModel', userSchema);