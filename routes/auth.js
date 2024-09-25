import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";
import multer from "multer";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.use(cors());
router.use(express.json());
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "User registration failed" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access denied");

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};

router.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const fullProfilePhotoUrl = user.profilePhoto
      ? `http://${req.headers.host}/${user.profilePhoto.replace(/\\/g, '/')}` // Replace backslashes for URL
      : null;

    return res.status(200).json({
      ...user.toObject(),
      profilePhoto: fullProfilePhotoUrl,
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user data" });
  }
});

router.get("/userProfile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const fullProfilePhotoUrl = user.profilePhoto
      ? `http://${req.headers.host}/${user.profilePhoto.replace(/\\/g, '/')}`
      : null;

    return res.status(200).json({
      ...user.toObject(),
      profilePhoto: fullProfilePhotoUrl, // Ensure this is a full URL
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user data" });
  }
});

router.delete("/delete", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.send("User deleted successfully");
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + ".jpg");
  },
});

const upload = multer({ storage });

router.put("/update/:id", upload.single("profilePhoto"), async (req, res) => {
  const { id } = req.params;
  const { username, email, BOD, createdAt, gender } = req.body;
  const profilePhotoPath = req.file.path;

  try {
    const updateFields = { username, email, BOD, createdAt, gender };
    if (profilePhotoPath) {
      updateFields.profilePhoto = profilePhotoPath;
    }
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}); 

export default router;
