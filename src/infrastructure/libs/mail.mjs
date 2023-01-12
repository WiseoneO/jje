import nodemailer from 'nodemailer'
import config from '../../config/defaults.mjs';

export const sendMail = async options =>{
    let transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        auth: {
          user: config.mailuserid,
          pass: config.mailPassword
        }
      });

      const message = {
        from : `${config.mailName} <${config.mailFrom}>`,
        to : options.email,
        subject : options.subject,
        text : options.message
      }
    
      await transporter.sendMail(message)
}
