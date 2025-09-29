import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  updateComment,
} from "../controllers/comment.controllers.js";

const router = Router();
router.use(verifyJwt);

router.route("/:videoId").post(addComment);
router.route("/comment/:commentId").patch(updateComment).delete(deleteComment);
