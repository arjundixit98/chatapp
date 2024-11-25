const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("./public"));

const onlineUsers = new Map();

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const fullname = socket.handshake.auth.fullname;
  if (!username || !fullname) {
    return next(new Error("invalid username or fullname"));
  }
  socket.username = username;
  socket.fullname = fullname;
  next();
});
// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/chat-room", (req, res) => {
  const { fullname, username } = req.query;
  res.render("chatApp", { fullname, username });
});

app.get("/private-chat", (req, res) => {
  const { fullname, username } = req.query;
  res.render("privateChatApp", {
    fullname,
    username,
  });
});

// app.get("/private-chat", (req, res) => {
//   const uu = Array.from(onlineUsers.values());
//   // console.log(uu);

//   const { currentUserName, currentFullName, selectedUserID } = req.query;
//   console.log(currentUserName, currentFullName);
//   console.log(selectedUserID);
//   const currentUser = { currentUserName, currentFullName };
//   const selectedUser = onlineUsers.get(selectedUserID);

//   console.log(currentUser, selectedUser);
//   res.render("privateChatApp", { currentUser, selectedUser });
// });

io.on("connection", (socket) => {
  console.log(
    `A user is connected with username : ${socket.username} and id: ${socket.id}`
  );

  onlineUsers.set(socket.id, {
    userid: socket.id,
    username: socket.username,
    fullname: socket.fullname,
  });

  // Emit updated online users list to all clients
  io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));

  //Broadcast received message from user to all other users
  socket.on("chat-message", ({ sender, message }) => {
    console.log(`Message received from user ${socket.fullname}: ${message}`);
    socket.broadcast.emit("broadcast-message", { sender, message });
  });

  socket.on("private-message", ({ message, to }) => {
    console.log(
      `Message sent from user ${socket.username} to ${
        onlineUsers.get(to).username
      }: $`
    );
    socket.to(to).emit("broadcast-message", {
      message,
      sender: onlineUsers.get(to).username,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.username} is now disconnected`);
    onlineUsers.delete(socket.id);
    io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
  });
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
