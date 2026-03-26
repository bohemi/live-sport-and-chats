import { createServer } from "http";
import express from "express";
import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { ChatHistory, Users } from "./models/models.js";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import { getLiveCricketScore } from "./api/fetchScore.js";
import dotenv from "dotenv";

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

setInterval(async () => {
  // cricket
  if (rooms.cricket.length > 0) {
    console.log("getting live");
    const cricketScore = await getLiveCricketScore(process.env.CRICKET_URL);

    rooms.cricket.forEach((user) => {
      if (user.socket.readyState === 1) {
        user.socket.send(
          JSON.stringify({
            type: "score",
            room: "cricket",
            scoreData: cricketScore,
          }),
        );
      }
    });
  }
}, 5000);

wss.on("connection", (client) => {
  client.send(JSON.stringify("From server: Connected!"));

  // handle incoming messages from clients
  client.addEventListener("message", async (ev) => {
    const data = JSON.parse(ev.data);

    if (!data.token) {
      client.send(JSON.stringify({ type: "error", message: "token missing" }));
      client.close();
      return;
    }

    // verify user token
    const decoded = jwt.verify(data.token, process.env.JWT_KEY);
    const username = decoded.username;

    if (!username) {
      client.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
      client.close();
      return;
    }

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

      // ------ storing user detials in their socket ---------
      // so we dont have to do the expensive searching on every room to find which user
      // left the server.
      client.user = {
        username: newuser.username,
        room: newuser.room,
      };
      console.log("Stored:", newuser.username, "in", data.room);

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

      //temp
      // getScores();
    }
  });
  // handle error
  client.addEventListener("error", function clear() {
    console.log("error--Disconnected from the server");
  });
  // handle disconnection
  client.addEventListener("close", () => {
    // if the user was sent to close the server before pushing
    // them into the rooms array
    if (!client.user) {
      return;
    }
    const user = {
      username: client.user.username,
      room: client.user.room,
    };
    console.log(user.username, "has disconnected");
    const updateRoom = rooms[user.room].filter((u) => u.socket !== client);
    rooms[user.room] = updateRoom;

    handleMessages(user, "leave");
  });
});

async function getScores() {
  console.log("getting live");
  const cricketScore = await getLiveCricketScore(process.env.CRICKET_URL);

  rooms.cricket.forEach((user) => {
    if (user.socket.readyState === 1) {
      user.socket.send(
        JSON.stringify({
          type: "score",
          room: "cricket",
          scoreData: cricketScore,
        }),
      );
    }
  });
}

async function handleMessages(user, type, historyChats) {
  if (!user || !type) {
    console.error("error in handleMessage.", "user:", user, " type:", type);
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
  console.log("current:", rooms.cricket.length);
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
        console.log(`connected to port: ${port}`);
      });
    })
    .catch((err) => {
      console.error("connection failed: ", err);
    });
}

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

function getTime() {
  const time = new Date().toLocaleString().split(" ");
  return time[1];
}

app.post("/signup", async (req, res) => {
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
});

app.post("/login", async (req, res) => {
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
});
