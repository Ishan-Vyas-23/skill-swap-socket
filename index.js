const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 8900;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

let users = [];

const addUser = (userID, socketID) => {
  !users.some((user) => user.userID === userID) &&
    users.push({ userID, socketID });
};

const removeUser = (socketID) => {
  users = users.filter((user) => user.socketID != socketID);
};

const getUser = (userID) => {
  return users.find((user) => user.userID === userID);
};

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("addUser", (userID) => {
    userID ? addUser(userID, socket.id) : null;
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderID, recieverID, text }) => {
    const user = getUser(recieverID);
    if (user) {
      io.to(user.socketID).emit("getMessage", { senderID, text });
    }
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

app.get("/", (req, res) => {
  res.send("Socket server running");
});

server.listen(PORT, () => {
  console.log("Socket server running on port", PORT);
});
