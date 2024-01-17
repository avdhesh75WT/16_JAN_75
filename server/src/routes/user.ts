import express from "express";
import {
  getAllUsers,
  getUser,
  createPost,
  updatePost,
  updateUser,
  deletePost,
  createComment,
  updateComment,
  likeHandler,
} from "../controllers/user";
import { verifyToken } from "../middleware/auth";
import { upload } from "../cloudinary";
const router = express.Router();

router.get("/", getAllUsers);
router.get("/:userId", verifyToken, getUser);
router.post("/:userId/create", verifyToken, upload.single("photo"), createPost);
router.patch("/:userId/update", verifyToken, updateUser);
router.patch("/:userId/:postId/update", verifyToken, updatePost);
router.delete("/:userId/:postId/delete", verifyToken, deletePost);

router.patch("/:userId/:postId/handleLike", verifyToken, likeHandler);
router.post("/:userId/:postId/comment", verifyToken, createComment);
router.patch("/:userId/:postId/:commentId/update", verifyToken, updateComment);

export default router;
