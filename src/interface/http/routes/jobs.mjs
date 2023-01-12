import express from 'express';
const router = express.Router();
import {verifyToken, authorizeRole} from '../../../interface/http/middlewares/verifyToken.mjs'
import {
    newJob,
    getAllJobs,
    getJobsInRadius,
    updateJob,
    deleteJob,
    getJob,
    jobStats
} from '../controllers/jobController.mjs'

router.post('/job/create-job',verifyToken, authorizeRole('employer', 'admin'), newJob);
router.get('/jobs/get-all', getAllJobs);
router.get('/job/:id/:slug', getJob);
router.get('/stats/:topic', jobStats);
router.get('/jobs/:zipcode/:distance', getJobsInRadius);
router.put('/jobs/:id/update-job',verifyToken, authorizeRole('employer', 'admin'), verifyToken, updateJob);
router.delete('/jobs/:id/delete-job',verifyToken, authorizeRole('employer', 'admin'), verifyToken, deleteJob);

export default router