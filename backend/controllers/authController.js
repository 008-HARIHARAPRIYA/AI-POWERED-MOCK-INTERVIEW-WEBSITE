import { signupUser, loginUser } from "../services/authService.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, contact } = req.body;
    const resume = req.files?.resume?.[0]?.path;
    const profileImage = req.files?.profileImage?.[0]?.path;

    const result = await signupUser({ name, email, password, contact, resume, profileImage });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
