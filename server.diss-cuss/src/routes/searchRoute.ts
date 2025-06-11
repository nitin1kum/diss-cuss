import express, { Router } from 'express';
import { getSearchResults } from '../controllers/searchController';
const router : Router = express.Router();

router.get("/",getSearchResults);

export default router;