import express, { Router } from "express";
import {
  createReply,
  createThread,
  getDiscussionThreads,
  getThread,
  likeThread,
  threadFaker,
} from "../controllers/threadController";
const router: Router = express.Router();

router.get("/discussion/:discussion_id", getDiscussionThreads);

router.get("/thread/:thread_id", getThread);

router.post("/create/thread", express.json({ limit: "1mb" }), createThread);

router.post("/create/reply", express.json({ limit: "1mb" }), createReply);

router.post("/update/like", likeThread);

router.get("/faker",threadFaker)

export default router;
