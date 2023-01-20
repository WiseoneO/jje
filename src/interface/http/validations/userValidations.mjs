import joi from 'joi';
import joiPasswordComplexity from 'joi-password-complexity';
const complexityOptions = {
    min: 8,
    max: 50,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  }
export const userValidation = (user)=>{
    const schema = joi.object({
        name: joi.string().alphanum().min(3).max(30).required(),
        password :joiPasswordComplexity(complexityOptions).required(),
        confirmPassword: joi.string().min(8).max(128).required('Password missmatch').valid(joi.ref('password')),
        role: joi.string().alphanum().required(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    }).unknown();
    return schema.validate(user)
}
export const updateUserData = (user)=>{
    const schema = joi.object({
        name: joi.string().alphanum().min(3).max(30).required(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    }).unknown();
    return schema.validate(user)
}
export const resetPassword = (user)=>{
    const schema = joi.object({
        newPassword :joiPasswordComplexity(complexityOptions).required(),
        confirmPassword: joi.string().min(8).max(128).required('Password missmatch').valid(joi.ref('newPassword')),
    }).unknown();
    return schema.validate(user)
}
export const changedPassword = (user)=>{
    const schema = joi.object({
        newPassword :joiPasswordComplexity(complexityOptions).required(),
        currentPassword :joiPasswordComplexity(complexityOptions).required(),
    }).unknown();
    return schema.validate(user)
}
