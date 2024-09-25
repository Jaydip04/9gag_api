import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

app.use(
  express.urlencoded({
    extended: true,
  })
);

async function connectDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Database connected successfully");
    
    app.use("/9GAG/auth", authRoutes);
    app.use("/9GAG/post", postsRoutes);

    app.get("/", (req, res) => {
      res.send("Product API CRUD");
    });
    
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Exit process with failure
  }
}

// mongoose
//   .connect(mongoURI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

connectDB();

const PORT = port || 3030;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
