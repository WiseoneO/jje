import express from "express";
import { signUp,login,forgotPassword,resetUserPassword} from "../controllers/authController.mjs";
const router = express.Router();

router.post('/register',signUp )
router.post('/login',login );
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetUserPassword);


export default router;