import express, { Router } from 'express';
import { getMetaData } from '../controllers/metadataController';
const router : Router = express.Router();

router.get("/",getMetaData)

export default router;