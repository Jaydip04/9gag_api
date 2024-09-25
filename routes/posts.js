import express from "express";
import cors from "cors";
import Post from "../models/PostSchema.js";

const router = express.Router();
router.use(cors());
router.use(express.json());

router.post("/createPosts", async (req, res) => {
  const {
    postHeading,
    postSubHeading,
    postVideoUrl,
    tags,
    postLikeCount,
    postCommentCount,
    postHoursCount,
    userId,
  } = req.body;

  try {
    const newPost = new Post({
      postHeading,
      postSubHeading,
      postVideoUrl,
      tags,
      postLikeCount,
      postCommentCount,
      postHoursCount,
      userId,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/getPosts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/getCurrentUserPosts/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Post.find({ userId: userId });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
export default router;
