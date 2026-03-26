import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
  room: String,
  type: String,
  username: String,
  message: String,
  time: String,
});
export const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

const userLoginDataSchema = new mongoose.Schema({
  username: String,
  password: String,
});
export const Users = mongoose.model("Users", userLoginDataSchema);
