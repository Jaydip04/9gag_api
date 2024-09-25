import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  postHeading: { type: String, required: true },
  postSubHeading: { type: String, required: true },
  postVideoUrl: { type: String, required: true },
  tags: { type: [String], required: true },
  postLikeCount: { type: String, required: true },
  postCommentCount: { type: String, required: true },
  postHoursCount: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: {  type: mongoose.Schema.Types.ObjectId, ref: 'users',required: true },
});

const Post = mongoose.model("posts", PostSchema);

export default Post;
