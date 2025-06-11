import express, { Router } from "express";
import { countUrls, getUrls } from "../controllers/sitemapController";
const router: Router = express.Router();

router.get("/urls", getUrls);

router.get("/count", countUrls);

export default router;
