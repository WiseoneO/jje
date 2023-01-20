import express from "express";
import {getUsers, deleteUser } from "../controllers/adminController.mjs";
import {verifyToken, authorizeRole} from '../../../interface/http/middlewares/verifyToken.mjs'

const router = express.Router();
router.use(verifyToken)

router.get('/users', authorizeRole('admin'),getUsers )
router.delete('/user/:id', authorizeRole('admin'),deleteUser )


export default router;