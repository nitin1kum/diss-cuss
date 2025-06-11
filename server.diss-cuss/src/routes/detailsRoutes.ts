import express, { Router } from 'express';
import { getDetails } from '../controllers/detailsController';
const router : Router = express.Router();

router.get("/",getDetails)

export default router;