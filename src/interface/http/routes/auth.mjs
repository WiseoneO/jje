import express from "express";
import { signUp,login,forgotPassword } from "../controllers/authController.mjs";
const router = express.Router();

router.post('/register',signUp )
router.post('/login',login );
router.post('/forgot-password', forgotPassword)


export default router;