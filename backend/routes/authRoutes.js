import express from "express";
import multer from "multer";
import path from "path";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "resume") cb(null, "uploads/resumes");
    else if (file.fieldname === "profileImage") cb(null, "uploads/profileImages");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/signup", upload.fields([{ name: "resume" }, { name: "profileImage" }]), signup);
router.post("/login", login);

export default router;
