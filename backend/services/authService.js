import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const signupUser = async ({ name, email, password, contact, resume, profileImage }) => {
  let user = await User.findOne({ email });
  if (user) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  user = new User({ name, email, password: hashedPassword, contact, resume, profileImage });
  await user.save();

  return {
    message: "Signup successful",
    user: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      contact: user.contact,
      resume: user.resume,
      profileImage: user.profileImage,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return {
    message: "Login successful",
    user: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      contact: user.contact,
      resume: user.resume,
      profileImage: user.profileImage,
    },
  };
};
