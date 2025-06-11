import express, { Router } from 'express';
import { popularMovies, popularTvShows, upcomingMovies } from '../controllers/homeDataController';
const router : Router = express.Router();

// popular movies routes
router.get("/popular/movies",popularMovies);

// popular tv show routes
router.get("/popular/tv",popularTvShows);

// upcoming movies routes
router.get("/upcoming/movies",upcomingMovies);

export default router;