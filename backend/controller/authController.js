import { Users } from "../models/models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async function signUp(req, res) {
  const { username, password } = req.body;

  const existingUser = await Users.findOne({ username });

  if (existingUser) {
    return res.json({ success: false, message: "User exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Users.create({
    username,
    password: hashedPassword,
  });

  const token = jwt.sign({ username: username }, process.env.JWT_KEY, {
    expiresIn: "1h",
  });

  res.json({ success: true, token });
}

export async function login(req, res) {
  const { username, password } = req.body;

  const user = await Users.findOne({ username });

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({ success: false, message: "Wrong password" });
  }

  const token = jwt.sign({ username: user.username }, process.env.JWT_KEY, {
    expiresIn: "1h",
  });

  res.json({ success: true, token });
}
