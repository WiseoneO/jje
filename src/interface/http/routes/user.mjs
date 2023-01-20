import express from 'express';
const router = express.Router();
import {verifyToken, authorizeRole} from '../../../interface/http/middlewares/verifyToken.mjs'
import {userProfile,changePassword,updateUser,getAppliedJobs,getPublishedJobs,deleteUser} from '../controllers/userController.mjs'

router.get('/profile',verifyToken,userProfile);
router.get('/jobs/applied',verifyToken,authorizeRole('user'),getAppliedJobs);
router.get('/jobs/published',verifyToken,authorizeRole('employer','admin'),getPublishedJobs);
router.put('/change-password',verifyToken,changePassword);
router.put('/update-profile',verifyToken,updateUser);
router.delete('/delete-account',verifyToken,deleteUser);


export default router