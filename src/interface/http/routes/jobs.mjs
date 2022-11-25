import express from 'express';
const router = express.Router();
import {newJob,getAllJobs,getJobsInRadius} from '../controllers/jobController.mjs'

router.post('/job/create-job', newJob);
router.get('/jobs/get-all', getAllJobs);
router.get('/jobs/:zipcode/:distance', getJobsInRadius);

export default router