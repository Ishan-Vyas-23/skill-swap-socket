const PORT = process.env.PORT || 8900;

const io = require("socket.io")(PORT, {
  cors: {
    origin: process.env.CLIENT_URL,
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
