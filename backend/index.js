import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import express from "express";
import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { ChatHistory } from "./models/models.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import { getLiveCricketScore } from "./api/fetchScore.js";
import dotenv from "dotenv";
import startScoreUpdates from "./services/scoreServices.js";
import signUp, { login } from "./controller/authController.js";
import { signupSchema, validate } from "./middleware/validate.js";
import logger from "./utils/logger.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

connect(server, process.env.DB_URL, process.env.PORT);
mongooseStatus();

let rooms = {
  cricket: [],
  // football: [],
  // basketball: [],
};

// fetch scores
startScoreUpdates(rooms);

wss.on("connection", (client) => {
  client.send(JSON.stringify("From server: Connected!"));

  // handle incoming messages from clients
  client.addEventListener("message", async (ev) => {
    const data = JSON.parse(ev.data);

    try {
      if (!data.token) {
        throw new Error("Token missing");
      }
      // verify user token
      const decoded = jwt.verify(data.token, process.env.JWT_KEY);
      const username = decoded.username;
    } catch (error) {
      logger.error(
        `failed login attempt: ${error.message} from ${data.username || "unknown"}`,
      );
      client.send(
        JSON.stringify({ type: "error", message: "Invalid Session" }),
      );
      client.close();
    }
    // proceed further if user is valid

    // handle joining
    if (data.type == "join") {
      const newuser = {
        socket: client,
        username: data.username,
        room: data.room,
        //pushing time and id element in the new user
        time: getTime(),
        id: randomUUID(),
      };

      rooms[data.room].push(newuser);
      const user = rooms[data.room].find((u) => u.socket === client);

      console.info(`Stored: ${user.username} in ${data.room}`);
      // ------ storing user details in their socket ---------
      // so we dont have to search every room to find which user left.
      client.user = {
        username: newuser.username,
        room: newuser.room,
      };

      handleMessages(user, data.type);
      getPreviousMessagesFromDB(20, user);
    }
    // handle public messages
    if (data.type == "chat") {
      const user = {
        socket: client,
        username: data.username,
        room: data.room,
        message: data.message,
        time: getTime(),
      };
      handleMessages(user, data.type);
      storeMessagesInDB(user.username, user.message, user.room, user.time);
    }
  });
  // handle error
  client.addEventListener("error", function clear() {
    logger.info("error!! Disconnected from the server");
  });
  // handle disconnection
  client.addEventListener("close", () => {
    if (!client.user) {
      return;
    }
    const user = {
      username: client.user.username,
      room: client.user.room,
    };
    logger.info(`${user.username} has disconnected`);
    const updateRoom = rooms[user.room].filter((u) => u.socket !== client);
    rooms[user.room] = updateRoom;

    handleMessages(user, "leave");
  });
});

async function handleMessages(user, type, historyChats) {
  if (!user || !type) {
    logger.error(`error in handleMessage user: ${user}, " type: ${type}`);
    return;
  }

  if (type == "join") {
    broadCast({
      username: user.username,
      message: `${user.username} joined`,
      room: user.room,
      type: type,
      time: user.time,
      onlineUsers: rooms[user.room].map((u) => u.username),
    });
  }
  if (type == "chat") {
    broadCast({
      username: user.username,
      message: user.message,
      room: user.room,
      type: type,
      time: user.time,
    });
  }
  if (type == "history") {
    sendPreviousMessages(user, historyChats);
  }
  if (type == "leave") {
    broadCast({
      username: user.username,
      message: `${user.username} has left`,
      room: user.room,
      type: type,
      time: getTime(),
      onlineUsers: rooms[user.room].map((u) => u.username),
    });
  }
}

function broadCast(data) {
  rooms[data.room].forEach((user) => {
    if (user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(
        JSON.stringify({
          type: data.type,
          username: data.username || null,
          message: data.message,
          time: data.time,
          onlineUsers: data.onlineUsers || null,
        }),
      );
    }
  });
  console.log(`${data.message}`);
}

function sendPreviousMessages(user, chats) {
  if (user.socket.readyState === WebSocket.OPEN) {
    user.socket.send(JSON.stringify({ history: chats }));
  }
}

function storeMessagesInDB(username, message, room, time) {
  const data = new ChatHistory({
    room: room,
    type: "history",
    username: username,
    message: message,
    time: time,
  });
  data.save();
}

async function getPreviousMessagesFromDB(totalChats, user) {
  const messages = await ChatHistory.find({ room: user.room }).limit(
    totalChats || 20,
  );
  handleMessages(user, "history", messages);
}

function connect(server, uri, port) {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("connected to db");
      server.listen(port, () => {
        logger.info(`server successfully started on port: ${port}`);
      });
    })
    .catch((err) => {
      logger.error("failed on server connection: ", err);
    });
}

function getTime() {
  const time = new Date().toLocaleString().split(" ");
  return time[1];
}
// handle login and signup
app.post("/signup", validate(signupSchema), signUp);
app.post("/login", login);
// since render free tier takes time to wake up backend. the request
// is to wakeup the render.com while user is still typing id
// and password. it will reuce the time to enter rooms
app.get("/api/ping", (req, res) => {
  res.status(200).json({ status: "ok", message: "server is awake" });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
  });
});

function mongooseStatus() {
  const db = mongoose.connection;

  db.on("connecting", () => {
    console.log("Connecting to MongoDB...");
  });

  db.on("connected", () => {
    console.log("Connected to MongoDB successfully!");
  });

  db.once("open", () => {
    console.log("MongoDB connection opened");
  });

  db.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  db.on("disconnected", () => {
    console.log("Disconnected from MongoDB.");
  });

  db.on("reconnected", () => {
    console.log("Reconnected to MongoDB.");
  });

  db.on("close", () => {
    console.log("MongoDB connection closed.");
  });
}
