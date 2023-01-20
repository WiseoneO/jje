import dotenv from "dotenv";
dotenv.config();

const config = {
    port : process.env.PORT || 6000,
    localMongod : process.env.MONGODB_LOCAL_CONNECTION,
    liveMongod : process.env.MONGODB_LIVE_CONNECTION,
    env : process.env.NODE_ENV,
    projectName : process.env.PROJECT_NAME,

    // JWT
    userSecret : process.env.USER_JWT_SECRET_KEY,
    userEmailSecret : process.env.USER_EMAIL_VERIFICATION_SECRET,
    userReset : process.env.USER_RESET,
    expiresIn: process.env.EXPIRESIN,
    
    
    // email
    emailHost : process.env.MAIL_TRAP_HOST,
    emailPort : process.env.MAIL_TRAP_PORT,
    mailuserid : process.env.MAIL_TRAP_USER,
    mailPassword : process.env.MAIL_TRAP_PASSWORD,
    mailFrom: process.env.SMTP_FROM_EMAIL,
    mailName: process.env.SMTP_FROM_NAME,

  
    // CLOUDINARY
    cloudName : process.env.CLOUD_NAME,
    cloudKey : process.env.CLOUDINARY_API_KEY,
    cloudSecret : process.env.CLOUDINARY_API_SECRET,

    // MapQuest
    mapquestProvider: process.env.GEOCODER_PROVIDER,
    mapquestApikey: process.env.GEOCODER_API_KEY,

    // Files
    max_file_size: process.env.MAX_FILE_SIZE,
    upload_path: process.env.UPLOAD_PATH
}



export default config